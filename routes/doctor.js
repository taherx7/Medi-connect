const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is doctor
const isDoctor = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'doctor') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

router.use(isDoctor);

// GET Dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const doctorRes = await db.query('SELECT * FROM doctors WHERE id = $1', [req.session.user.id]);
        const doctor = doctorRes.rows[0];

        // Fetch reservations
        const reservationsRes = await db.query(`
            SELECT r.*, u.name as patient_name, u.email as patient_email 
            FROM reservations r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.doctor_id = $1 
            ORDER BY r.time_slot ASC
        `, [req.session.user.id]);

        res.render('doctor/dashboard', { 
            user: req.session.user, 
            doctor, 
            reservations: reservationsRes.rows 
        });
    } catch (err) {
        console.error(err);
        res.render('doctor/dashboard', { user: req.session.user, doctor: {}, reservations: [], error: 'Error loading dashboard' });
    }
});

const multer = require('multer');
const supabase = require('../config/supabase');

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// POST Update Profile
router.post('/profile', upload.single('photo'), async (req, res) => {
    const { name, description, location, specialty, cost, phone, working_hours_start, working_hours_end, avg_consultation_time } = req.body;
    let photos_url = null;

    try {
        // Handle Photo Upload
        if (req.file && supabase) {
            const file = req.file;
            const fileName = `doctor-${req.session.user.id}-${Date.now()}.jpg`;
            
            try {
                const { data, error } = await supabase
                    .storage
                    .from(process.env.SUPABASE_BUCKET || 'doctor-photos')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (error) {
                    console.error('❌ Supabase upload error:', error.message);
                    if (error.statusCode === '404') {
                        console.error('   Bucket "' + (process.env.SUPABASE_BUCKET || 'doctor-photos') + '" does not exist!');
                        console.error('   Create it in Supabase Dashboard: Storage > New Bucket > doctor-photos (Public)');
                    }
                } else {
                    // Get public URL
                    const { data: publicData } = supabase
                        .storage
                        .from(process.env.SUPABASE_BUCKET || 'doctor-photos')
                        .getPublicUrl(fileName);
                        
                    photos_url = publicData.publicUrl;
                    console.log('✅ Photo uploaded:', photos_url);
                }
            } catch (uploadError) {
                console.error('❌ Upload failed:', uploadError.message);
            }
        }

        // Update profile
        let updateQuery = `
            UPDATE doctors 
            SET name = $1, description = $2, location = $3, specialty = $4, cost = $5, phone = $6,
                working_hours_start = $7, working_hours_end = $8, avg_consultation_time = $9
        `;
        let params = [name, description, location, specialty, cost, phone, working_hours_start, working_hours_end, avg_consultation_time];
        
        if (photos_url) {
            updateQuery += `, photos_url = $10 WHERE id = $11`;
            params.push(photos_url, req.session.user.id);
        } else {
            updateQuery += ` WHERE id = $10`;
            params.push(req.session.user.id);
        }

        await db.query(updateQuery, params);
        
        // Update session user name if it was changed
        if (name && req.session.user) {
            req.session.user.name = name;
        }
        
        res.redirect('/doctor/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/doctor/dashboard');
    }
});

// POST Block Time
router.post('/block-time', async (req, res) => {
    const { selected_date, start_time, end_time } = req.body;
    try {
        // Combine date and time
        const startDateTime = `${selected_date} ${start_time}`;
        const endDateTime = `${selected_date} ${end_time}`;
        
        await db.query(
            'INSERT INTO blocked_slots (doctor_id, start_time, end_time) VALUES ($1, $2, $3)',
            [req.session.user.id, startDateTime, endDateTime]
        );
        res.redirect('/doctor/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/doctor/dashboard?error=Failed to block time');
    }
});

// POST Delete Account
router.post('/delete', async (req, res) => {
    try {
        const doctorId = req.session.user.id;
        
        // Delete reservations first (if no cascade)
        await db.query('DELETE FROM reservations WHERE doctor_id = $1', [doctorId]);
        
        // Delete blocked slots (cascade handles this but safe to do)
        await db.query('DELETE FROM blocked_slots WHERE doctor_id = $1', [doctorId]);

        // Delete doctor
        await db.query('DELETE FROM doctors WHERE id = $1', [doctorId]);
        
        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/doctor/dashboard?error=Delete failed');
    }
});

module.exports = router;
