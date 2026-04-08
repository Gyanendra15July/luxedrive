// Single source of truth for API base URL
// Relative path works on both localhost AND production (Render, Railway, etc.)
const API_URL = '/api';

// ─── Auth Helper ──────────────────────────────────────────────────────────────
const auth = {
    getToken: () => localStorage.getItem('token'),

    getUser: () => {
        try { return JSON.parse(localStorage.getItem('user')); }
        catch { return null; }
    },

    setSession: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role',  user.role);
        localStorage.setItem('name',  user.name);
        localStorage.setItem('user',  JSON.stringify(user));
    },

    logout: () => {
        localStorage.clear();
        window.location.href = '/login';
    },

    isLoggedIn: () => !!localStorage.getItem('token'),

    isAdmin: () => localStorage.getItem('role') === 'admin',

    // Redirect to login if not authenticated
    requireLogin: () => {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login';
            return false;
        }
        return true;
    },

    // Redirect non-admins away from admin pages
    requireAdmin: () => {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login';
            return false;
        }
        if (localStorage.getItem('role') !== 'admin') {
            window.location.href = '/dashboard';
            return false;
        }
        return true;
    }
};

// Helper: authenticated fetch
async function authFetch(url, options = {}) {
    const token = auth.getToken();
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    });
}
