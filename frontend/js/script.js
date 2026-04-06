const API_URL = '/api';

/**
 * Escapes HTML characters to prevent XSS attacks.
 */
function escapeHTML(str) {
    if (!str) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
}

function setupScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const elementVisible = 150;

    const reveal = () => {
        for (const el of reveals) {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < window.innerHeight - elementVisible) {
                el.classList.add('active');
            }
        }
    };

    window.addEventListener('scroll', reveal, { passive: true });
    reveal();
}

/**
 * Optimized Auth Status Check
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    const navAuth = document.getElementById('nav-auth-btns');

    const userDashboardLink = document.getElementById('userDashboardLink');
    const adminDashboardLink = document.getElementById('adminDashboardLink');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (token) {
        if (navAuth) {
            navAuth.innerHTML = `
                <a href="/profile" style="margin-right: 15px; color: var(--primary-light); font-weight: 600;"><i class="fas fa-user-circle"></i> ${escapeHTML(userName)}</a>
                <a href="/dashboard" class="btn btn-outline" style="padding: 0.5rem 1rem;"><i class="fas fa-list-ul"></i> Bookings</a>
                <button onclick="logout()" class="btn btn-primary" style="margin-left: 10px; padding: 0.5rem 1rem;">Logout</button>
            `;
        }
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        if (userDashboardLink) userDashboardLink.style.display = role === 'user' ? 'inline-flex' : 'none';
        if (adminDashboardLink) adminDashboardLink.style.display = role === 'admin' ? 'inline-flex' : 'none';
    } else {
        if (navAuth) navAuth.innerHTML = '';
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userDashboardLink) userDashboardLink.style.display = 'none';
        if (adminDashboardLink) adminDashboardLink.style.display = 'none';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/';
}

/**
 * Fetch Cars with Security (XSS Escaping)
 */
async function fetchFeaturedCars() {
    const carGrid = document.getElementById('featured-cars');
    if (!carGrid) return;

    try {
        const response = await fetch(`${API_URL}/cars`);
        const cars = await response.json();
        
        if (!Array.isArray(cars)) {
            carGrid.innerHTML = '<p style="text-align: center; width: 100%;">Database connection required to display cars.</p>';
            return;
        }
        
        const featured = cars.slice(0, 3);
        
        carGrid.innerHTML = featured.map(car => `
            <div class="car-card">
                <img src="${car.image}" alt="${escapeHTML(car.car_name)}" class="car-img" onerror="this.src='https://via.placeholder.com/300x200?text=Premium+Car'">
                <div class="car-info">
                    <h3>${escapeHTML(car.car_name)}</h3>
                    <div class="car-meta">
                        <span>${escapeHTML(car.brand)}</span>
                        <span>${escapeHTML(car.type)}</span>
                    </div>
                    <div class="car-price">$${car.price_per_day} / day</div>
                    <a href="/booking?id=${car.id}" class="btn btn-primary" style="display: block; text-align: center; margin-top: 1rem;">Book Now</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching cars:', error);
    }
}

/**
 * Handles User Registration
 */
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const emailEl = document.getElementById('email') || document.getElementById('regEmail');
    const passwordEl = document.getElementById('password') || document.getElementById('regPassword');
    const email = emailEl ? emailEl.value : '';
    const password = passwordEl ? passwordEl.value : '';
    const mobileCountryCode = document.getElementById('mobileCountryCode')?.value || '';
    const mobileNumber = document.getElementById('mobileNumber')?.value || '';
    const mobile = `${mobileCountryCode}${String(mobileNumber).trim()}`.trim();

    if (!mobile || mobile === mobileCountryCode) {
        alert('Please enter your mobile number.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, mobile })
        });
        const data = await res.json();
        if (res.ok) {
            // Auto-login: store token and redirect to home
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('name', data.name);
            window.location.href = '/';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('A network error occurred. Please try again.');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('name', data.name);
            // Redirect to home page after successful login
            window.location.href = '/';
        } else {
            alert(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (err) {
        console.error(err);
        alert('Connection error. Please check your internet.');
    }
}

async function handleContact(e) {
    e.preventDefault();

    const name = document.getElementById('contactName')?.value?.trim();
    const email = document.getElementById('contactEmail')?.value?.trim();
    const subject = document.getElementById('contactSubject')?.value?.trim();
    const message = document.getElementById('contactMessage')?.value?.trim();

    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            alert(data.message || 'Failed to send message.');
            return;
        }

        alert('Thanks! Your message has been sent.');
        document.getElementById('contactForm')?.reset();
    } catch (err) {
        console.error(err);
        alert('Failed to send message. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupScrollReveal();
    checkAuth();
    fetchFeaturedCars();
    
    const regForm = document.getElementById('registerForm');
    if (regForm) regForm.addEventListener('submit', handleRegister);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', handleContact);
});
