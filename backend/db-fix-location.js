const db = require('./config/db');

async function fixLocationColumns() {
    try {
        console.log("Analyzing bookings schema...");

        // Safely add pickup_location
        try {
            await db.query('ALTER TABLE bookings ADD COLUMN pickup_location VARCHAR(255) NOT NULL DEFAULT "Unknown"');
            console.log("SUCCESS: Added pickup_location column.");
        } catch(e) {
            if(e.code === 'ER_DUP_FIELDNAME') console.log("pickup_location already exists.");
            else console.log("Error adding pickup_location:", e.message);
        }

        // Safely add destination
        try {
            await db.query('ALTER TABLE bookings ADD COLUMN destination VARCHAR(255) DEFAULT NULL');
            console.log("SUCCESS: Added destination column.");
        } catch(e) {
            if(e.code === 'ER_DUP_FIELDNAME') console.log("destination already exists.");
            else console.log("Error adding destination:", e.message);
        }

        console.log("Database schema fix complete.");
        process.exit(0);
    } catch(err) {
        console.error("Critical error:", err);
        process.exit(1);
    }
}

fixLocationColumns();
