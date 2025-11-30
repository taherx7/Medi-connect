const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function initDb() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Running schema...');
        await db.query(schema);
        console.log('Database initialized successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDb();
