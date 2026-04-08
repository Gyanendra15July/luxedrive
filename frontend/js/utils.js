const API_URL = '/api';

const auth = {
    getToken: () => localStorage.getItem('token'),
    getUser: () => JSON.parse(localStorage.getItem('user')),
    setUser: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    },
    logout: () => {
        localStorage.clear();
        window.location.href = 'login.html';
    },
    isLoggedIn: () => !!localStorage.getItem('token'),
    isAdmin: () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user && user.role === 'admin';
    }
};

// Check if page needs protection
const protectRoute = (adminOnly = false) => {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
    }
    if (adminOnly && !auth.isAdmin()) {
        window.location.href = 'dashboard.html';
    }
};
