const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password using bcrypt.
 * @param {string} password 
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
    if (!password) throw new Error('Password is required for hashing');
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain-text password against a hashed version.
 * @param {string} password 
 * @param {string} storedHash 
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, storedHash) {
    if (!password || !storedHash) return false;
    return await bcrypt.compare(password, storedHash);
}

module.exports = { hashPassword, verifyPassword };
