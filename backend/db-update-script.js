const db = require('./config/db');

async function runUpdates() {
    try {
        console.log("Adding profile_image to users...");
        await db.query('ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL').catch(e => console.log('Already exists or error:', e.message));
        
        console.log("Adding status to bookings...");
        await db.query(`ALTER TABLE bookings ADD COLUMN status VARCHAR(20) DEFAULT 'Confirmed'`).catch(e => console.log('Already exists or error:', e.message));

        console.log("Creating otps table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                otp_code VARCHAR(10) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `).catch(e => console.log('Already exists or error:', e.message));
        
        console.log("Database schema update complete.");
        process.exit(0);
    } catch(err) {
        console.error("Critical error:", err);
        process.exit(1);
    }
}

runUpdates();
