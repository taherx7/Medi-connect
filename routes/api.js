const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/doctors/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const result = await db.query(`
            SELECT id, name, location, photos_url FROM doctors 
            WHERE name ILIKE $1 OR location ILIKE $1 
            LIMIT 10
        `, [`%${q}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
