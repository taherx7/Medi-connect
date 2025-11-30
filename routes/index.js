const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        // Fetch stats
        const doctorCount = await db.query('SELECT COUNT(*) FROM doctors');
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const reservationCount = await db.query('SELECT COUNT(*) FROM reservations');

        // Fetch top doctors
        const result = await db.query('SELECT * FROM doctors LIMIT 6');
        
        res.render('index', { 
            user: req.session.user,
            doctors: result.rows,
            stats: {
                doctors: doctorCount.rows[0].count,
                patients: userCount.rows[0].count,
                appointments: reservationCount.rows[0].count
            }
        });
    } catch (err) {
        console.error(err);
        res.render('index', { 
            user: req.session.user, 
            doctors: [],
            stats: { doctors: 0, patients: 0, appointments: 0 }
        });
    }
});

module.exports = router;
