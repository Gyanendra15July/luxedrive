const db = require('../config/db');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

exports.createMessage = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const email = normalizeEmail(req.body.email);
        const subject = String(req.body.subject || '').trim();
        const message = String(req.body.message || '').trim();

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'name, email, subject, and message are required' });
        }

        if (name.length > 100) return res.status(400).json({ message: 'name is too long' });
        if (email.length > 150) return res.status(400).json({ message: 'email is too long' });
        if (subject.length > 150) return res.status(400).json({ message: 'subject is too long' });
        if (message.length > 4000) return res.status(400).json({ message: 'message is too long' });

        await db.execute(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );

        return res.status(201).json({ message: 'Message received' });
    } catch (error) {
        return res.status(500).json({ message: 'Error saving message', error: error.message });
    }
};

