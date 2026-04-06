const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// MySQL connection configuration
const pool = mysql.createPool({
    // Support built-in Railway variables OR our custom .env variables
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASS || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'car_booking',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    
    // ETIMEDOUT Cloud Fixes
    connectTimeout: 30000, // 30 seconds explicitly for cloud network latency
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,

    // Must be disabled for strict cloud MySQL setups
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Advanced connection testing for Production Debugging
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database Connection Failed (ETIMEDOUT Triggered):');
        console.error(`- Host Used: ${pool.config.connectionConfig.host}`);
        console.error(`- Port Used: ${pool.config.connectionConfig.port}`);
        console.error(`- Error Code: ${err.code}`);
        console.error(`- Details: ${err.message}`);
    } else {
        console.log(`✅ Connected successfully to MySQL at ${pool.config.connectionConfig.host}:${pool.config.connectionConfig.port}`);
        connection.release();
    }
});

module.exports = pool.promise();
