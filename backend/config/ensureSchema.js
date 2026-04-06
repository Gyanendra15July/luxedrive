const db = require('./db');

async function columnExists(tableName, columnName) {
    const [rows] = await db.execute(
        `SELECT COUNT(*) AS cnt
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?`,
        [tableName, columnName]
    );
    return rows[0] && rows[0].cnt > 0;
}

async function ensureSchema() {
    try {
        // Minimal schema needed for the current frontend.
        await db.execute(
            `CREATE TABLE IF NOT EXISTS cars (
                id INT AUTO_INCREMENT PRIMARY KEY,
                car_name VARCHAR(100),
                brand VARCHAR(100),
                price_per_day INT,
                image VARCHAR(255),
                description TEXT,
                type VARCHAR(50) DEFAULT 'Luxury',
                availability_status VARCHAR(20) NOT NULL DEFAULT 'available'
            )`
        );

        const hasType = await columnExists('cars', 'type');
        if (!hasType) {
            await db.execute(`ALTER TABLE cars ADD COLUMN type VARCHAR(50) DEFAULT 'Luxury'`);
        }

        const hasAvailability = await columnExists('cars', 'availability_status');
        if (!hasAvailability) {
            await db.execute(
                `ALTER TABLE cars ADD COLUMN availability_status VARCHAR(20) NOT NULL DEFAULT 'available'`
            );
        }

        await db.execute(
            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                mobile VARCHAR(40),
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );

        const hasMobile = await columnExists('users', 'mobile');
        if (!hasMobile) {
            await db.execute(`ALTER TABLE users ADD COLUMN mobile VARCHAR(40)`);
        }

        await db.execute(
            `CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                car_id INT NOT NULL,
                pickup_date DATE NOT NULL,
                return_date DATE NOT NULL,
                total_price INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );

        await db.execute(
            `CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL,
                subject VARCHAR(150) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );
    } catch (err) {
        // Keep the server running so the UI can still load;
        // endpoints will return 500 with a useful message if DB is down.
        console.error('Schema check failed:', err.message);
    }
}

module.exports = ensureSchema;
