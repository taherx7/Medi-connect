const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to generate slots
const generateSlots = (startStr, endStr, durationMinutes, date) => {
    const slots = [];
    if (!startStr || !endStr || !durationMinutes) return slots;

    const [startHour, startMin] = startStr.split(':').map(Number);
    const [endHour, endMin] = endStr.split(':').map(Number);

    let current = new Date(date);
    current.setHours(startHour, startMin, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);

    while (current < end) {
        slots.push(new Date(current));
        current.setMinutes(current.getMinutes() + durationMinutes);
    }

    return slots;
};

// GET Search
router.get('/search', async (req, res) => {
    const { name, location, q } = req.query;
    
    let queryText = 'SELECT * FROM doctors WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (name) {
        queryText += ` AND name ILIKE $${paramCount}`;
        params.push(`%${name}%`);
        paramCount++;
    }

    if (location) {
        queryText += ` AND location ILIKE $${paramCount}`;
        params.push(`%${location}%`);
        paramCount++;
    }

    if (q) {
        queryText += ` AND (name ILIKE $${paramCount} OR location ILIKE $${paramCount})`;
        params.push(`%${q}%`);
        paramCount++;
    }

    try {
        const result = await db.query(queryText, params);

        res.render('index', { 
            user: req.session.user, 
            doctors: result.rows,
            searchPerformed: true // Flag to indicate this is a search result
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// GET Patient Dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    
    try {
        const result = await db.query(`
            SELECT r.*, d.name as doctor_name, d.location, d.phone 
            FROM reservations r 
            JOIN doctors d ON r.doctor_id = d.id 
            WHERE r.user_id = $1 
            ORDER BY r.time_slot DESC
        `, [req.session.user.id]);

        res.render('patient/dashboard', { 
            user: req.session.user, 
            reservations: result.rows,
            success: req.query.success 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// GET Doctor Profile & Slots (for rendering the page)
router.get('/doctor/:id', async (req, res) => {
    const doctorId = req.params.id;
    try {
        const doctorRes = await db.query('SELECT * FROM doctors WHERE id = $1', [doctorId]);
        const doctor = doctorRes.rows[0];

        if (!doctor) return res.redirect('/');

        // For initial page load, we don't need to generate slots
        // The calendar will fetch slots via AJAX

        res.render('doctor/profile', { 
            user: req.session.user, 
            doctor,
            error: req.query.error
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// GET Time Slots for a specific date (AJAX endpoint)
router.get('/doctor/:id/slots', async (req, res) => {
    const doctorId = req.params.id;
    const { date } = req.query;
    
    try {
        const doctorRes = await db.query('SELECT * FROM doctors WHERE id = $1', [doctorId]);
        const doctor = doctorRes.rows[0];

        if (!doctor) return res.json({ error: 'Doctor not found', slots: [] });

        const targetDate = new Date(date);
        const dateStr = targetDate.toISOString().split('T')[0];

        // Get reservations
        const reservationsRes = await db.query(`
            SELECT time_slot FROM reservations 
            WHERE doctor_id = $1 AND DATE(time_slot) = $2 AND status != 'cancelled'
        `, [doctorId, dateStr]);

        // Get blocked slots
        const blockedRes = await db.query(`
            SELECT start_time, end_time FROM blocked_slots 
            WHERE doctor_id = $1 AND DATE(start_time) = $2
        `, [doctorId, dateStr]);

        const bookedTimes = reservationsRes.rows.map(r => new Date(r.time_slot).getTime());

        const allSlots = generateSlots(
            doctor.working_hours_start, 
            doctor.working_hours_end, 
            doctor.avg_consultation_time, 
            targetDate
        );

        const availableSlots = allSlots.map(slot => {
            const slotTime = slot.getTime();
            // Check if booked
            const isBooked = bookedTimes.includes(slotTime) || blockedRes.rows.some(b => {
                const start = new Date(b.start_time).getTime();
                const end = new Date(b.end_time).getTime();
                return slotTime >= start && slotTime < end;
            });
            
            return {
                time: slot.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                isoTime: slot.toISOString(),
                isBooked: isBooked
            };
        });

        res.json({ slots: availableSlots });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', slots: [] });
    }
});

// POST Book Appointment
router.post('/book', async (req, res) => {
    const { doctor_id, time_slot, payment_method } = req.body;
    
    if (!req.session.user) {
        // Save the return URL to redirect back after login
        req.session.returnTo = `/patient/doctor/${doctor_id}`;
        return res.redirect('/auth/login');
    }

    try {
        // Check for existing active reservation
        const existing = await db.query(`
            SELECT * FROM reservations 
            WHERE user_id = $1 AND time_slot > NOW() AND status != 'cancelled'
        `, [req.session.user.id]);

        if (existing.rows.length > 0) {
            return res.redirect(`/patient/doctor/${doctor_id}?error=You already have an active reservation.`);
        }

        await db.query(`
            INSERT INTO reservations (doctor_id, user_id, time_slot, status, payment_status)
            VALUES ($1, $2, $3, 'confirmed', $4)
        `, [doctor_id, req.session.user.id, time_slot, payment_method === 'online' ? 'paid' : 'pending']);

        res.redirect('/patient/dashboard?success=Reservation Confirmed!'); 
    } catch (err) {
        console.error(err);
        res.redirect(`/patient/doctor/${doctor_id}?error=Booking failed`);
    }
});

module.exports = router;
