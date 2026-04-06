const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function initDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || ''
    });

    try {
        console.log('Connecting to MySQL...');
        const dbName = process.env.DB_NAME || 'car_booking';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database ${dbName} created.`);

        await connection.query(`USE \`${dbName}\`;`);

        const sql = fs.readFileSync(path.join(__dirname, '../database', 'car_booking.sql'), 'utf8');

        const statements = sql.split(';').filter(s => s.trim() !== '');

        for (let statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }

        console.log('Database schema and data imported successfully.');

    } catch (err) {
        console.error('Error initializing database:', err.message);
    } finally {
        await connection.end();
        process.exit();
    }
}

initDB();
