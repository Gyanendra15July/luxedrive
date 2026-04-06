const crypto = require('crypto');

function base64urlFromBuffer(buffer) {
    return Buffer.from(buffer)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64urlFromString(str) {
    return base64urlFromBuffer(Buffer.from(str, 'utf8'));
}

function base64urlToString(b64url) {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    return Buffer.from(b64 + pad, 'base64').toString('utf8');
}

function signHmacSha256(input, secret) {
    const sig = crypto.createHmac('sha256', secret).update(input).digest();
    return base64urlFromBuffer(sig);
}

function timingSafeEqual(a, b) {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
}

function signToken(payload, { expiresInSeconds = 60 * 60 * 24 } = {}) {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const now = Math.floor(Date.now() / 1000);

    const header = { alg: 'HS256', typ: 'JWT' };
    const body = { ...payload, iat: now, exp: now + expiresInSeconds };

    const data = `${base64urlFromString(JSON.stringify(header))}.${base64urlFromString(
        JSON.stringify(body)
    )}`;
    const signature = signHmacSha256(data, secret);
    return `${data}.${signature}`;
}

function verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const parts = (token || '').split('.');
    if (parts.length !== 3) throw new Error('Invalid token');

    const [h, p, s] = parts;
    const data = `${h}.${p}`;
    const expected = signHmacSha256(data, secret);
    if (!timingSafeEqual(expected, s)) throw new Error('Invalid token signature');

    const payload = JSON.parse(base64urlToString(p));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) throw new Error('Token expired');
    return payload;
}

module.exports = { signToken, verifyToken };
