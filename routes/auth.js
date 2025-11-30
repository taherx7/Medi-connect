const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const multer = require('multer');
const supabase = require('../config/supabase');

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// GET Login Page
router.get('/login', (req, res) => {
    res.render('login', { user: req.session.user, error: null });
});

// GET Register Page
router.get('/register', (req, res) => {
    const role = req.query.role || 'patient'; // Default to patient
    res.render('register', { user: req.session.user, error: null, role });
});

// POST Login
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    
    try {
        let user;
        if (role === 'doctor') {
            const result = await db.query('SELECT * FROM doctors WHERE email = $1', [email]);
            user = result.rows[0];
        } else {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            user = result.rows[0];
        }

        if (user && await bcrypt.compare(password, user.hashed_password)) {
            req.session.user = { id: user.id, name: user.name, role: role || user.role || 'patient' };
            
            // Check for saved return URL
            const returnTo = req.session.returnTo;
            delete req.session.returnTo; // Clear it after use
            
            if (returnTo) {
                res.redirect(returnTo);
            } else if (role === 'doctor') {
                res.redirect('/doctor/dashboard');
            } else {
                res.redirect('/');
            }
        } else {
            res.render('login', { user: null, error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error(err);
        res.render('login', { user: null, error: 'An error occurred' });
    }
});

// POST Register
router.post('/register', upload.single('id_photo'), async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    const currentRole = role === 'doctor' ? 'doctor' : 'patient';
    
    // Basic Validation
    if (!name || !email || !password) {
         return res.render('register', { user: null, error: 'Please fill in all required fields.', role: currentRole });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        let id_photo_url = null;

        // Handle ID photo upload for doctors
        if (role === 'doctor' && req.file && supabase) {
            const file = req.file;
            const fileName = `doctor-id-${email}-${Date.now()}.jpg`;
            
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
                } else {
                    const { data: publicData } = supabase
                        .storage
                        .from(process.env.SUPABASE_BUCKET || 'doctor-photos')
                        .getPublicUrl(fileName);
                        
                    id_photo_url = publicData.publicUrl;
                }
            } catch (uploadError) {
                console.error('❌ ID photo upload failed:', uploadError.message);
                // Continue registration without photo
            }
        }

        if (role === 'doctor') {
            // Check if email exists
            const existing = await db.query('SELECT * FROM doctors WHERE email = $1', [email]);
            if (existing.rows.length > 0) {
                return res.render('register', { user: null, error: 'Email already registered.', role: 'doctor' });
            }

            await db.query(
                'INSERT INTO doctors (name, email, hashed_password, phone) VALUES ($1, $2, $3, $4)',
                [name, email, hashedPassword, phone]
            );
        } else {
             // Check if email exists
            const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (existing.rows.length > 0) {
                return res.render('register', { user: null, error: 'Email already registered.', role: 'patient' });
            }

            // For patient, phone is optional or not requested in prompt, but schema has it. 
            // Prompt says "patient register with email and name and password". So phone might be undefined.
            await db.query(
                'INSERT INTO users (name, email, hashed_password, phone) VALUES ($1, $2, $3, $4)',
                [name, email, hashedPassword, phone || null]
            );
        }
        res.redirect('/auth/login');
    } catch (err) {
        console.error('Registration Error:', err);
        const currentRole = role === 'doctor' ? 'doctor' : 'patient';
        res.render('register', { user: null, error: 'System error during registration. Please try again.', role: currentRole });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
