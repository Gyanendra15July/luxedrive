// script.js  – shared across all frontend pages
// Requires utils.js to be loaded first

// ─── Scroll Reveal ──────────────────────────────────────────────────────────
function setupScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    const check = () => {
        for (const el of reveals) {
            if (el.getBoundingClientRect().top < window.innerHeight - 100)
                el.classList.add('active');
        }
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
}

// ─── Nav Auth State ─────────────────────────────────────────────────────────
function checkAuth() {
    const token   = localStorage.getItem('token');
    const name    = localStorage.getItem('name');
    const role    = localStorage.getItem('role');
    const navAuth = document.getElementById('nav-auth-btns');

    if (token && navAuth) {
        navAuth.innerHTML = `
            <a href="/profile" style="margin-right:15px; color:var(--primary-light); font-weight:600;">
                👤 ${name || 'Profile'}
            </a>
            ${role === 'admin' ? `<a href="/admin" class="btn btn-outline" style="padding:.5rem 1rem; margin-right:8px;">Admin Panel</a>` : `<a href="/dashboard" class="btn btn-outline" style="padding:.5rem 1rem; margin-right:8px;">My Bookings</a>`}
            <button onclick="auth.logout()" class="btn btn-primary" style="padding:.5rem 1rem;">Logout</button>
        `;
    }

    // Handle individual nav link IDs used on older pages
    const loginBtn          = document.getElementById('loginBtn');
    const logoutBtn         = document.getElementById('logoutBtn');
    const userDashboardLink = document.getElementById('userDashboardLink');
    const adminDashboardLink= document.getElementById('adminDashboardLink');

    if (token) {
        if (loginBtn)           loginBtn.style.display = 'none';
        if (logoutBtn)          logoutBtn.style.display = 'inline-flex';
        if (userDashboardLink)  userDashboardLink.style.display  = role === 'user'  ? 'inline-flex' : 'none';
        if (adminDashboardLink) adminDashboardLink.style.display = role === 'admin' ? 'inline-flex' : 'none';
    } else {
        if (loginBtn)           loginBtn.style.display = 'inline-flex';
        if (logoutBtn)          logoutBtn.style.display = 'none';
        if (userDashboardLink)  userDashboardLink.style.display  = 'none';
        if (adminDashboardLink) adminDashboardLink.style.display = 'none';
    }
}

function logout() { auth.logout(); }

// ─── Homepage Featured Cars ─────────────────────────────────────────────────
// DB schema: id, name, image, price_per_day, description, available
async function fetchFeaturedCars() {
    const carGrid = document.getElementById('featured-cars');
    if (!carGrid) return;

    try {
        const response = await fetch(`${API_URL}/cars`);
        const cars = await response.json();

        if (!Array.isArray(cars) || cars.length === 0) {
            carGrid.innerHTML = '<p style="text-align:center;width:100%;grid-column:1/-1">No cars available right now.</p>';
            return;
        }

        carGrid.innerHTML = cars.slice(0, 3).map(car => `
            <div class="car-card">
                <img src="${car.image ? '/uploads/' + car.image : 'https://placehold.co/400x250/1e293b/white?text=' + encodeURIComponent(car.name)}"
                     alt="${car.name}" class="car-img"
                     onerror="this.src='https://placehold.co/400x250/1e293b/white?text=Car'">
                <div class="car-info">
                    <h3>${car.name}</h3>
                    <div class="car-price">$${car.price_per_day} / day</div>
                    <p style="color:var(--gray);font-size:.9rem;margin:.5rem 0 1rem">${car.description || ''}</p>
                    <a href="/dashboard" class="btn btn-primary" style="display:block;text-align:center;">Book Now</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('[Featured Cars Error]', error);
        carGrid.innerHTML = '<p style="text-align:center;width:100%;grid-column:1/-1">Failed to load cars.</p>';
    }
}

// ─── Login Handler ───────────────────────────────────────────────────────────
async function handleLogin(e) {
    e.preventDefault();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res  = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            auth.setSession(data.user, data.token);
            window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Connection error. Please try again.');
    }
}

// ─── Register Handler ────────────────────────────────────────────────────────
async function handleRegister(e) {
    e.preventDefault();
    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role     = document.getElementById('role')?.value || 'user';

    try {
        const res  = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();

        if (res.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('Connection error. Please try again.');
    }
}

// ─── Contact Handler ─────────────────────────────────────────────────────────
async function handleContact(e) {
    e.preventDefault();
    alert('Thank you! Your message has been received.');
    e.target.reset();
}

// ─── DOMContentLoaded Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupScrollReveal();
    checkAuth();
    fetchFeaturedCars();

    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const contactForm  = document.getElementById('contactForm');

    if (loginForm)    loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (contactForm)  contactForm.addEventListener('submit', handleContact);
});
