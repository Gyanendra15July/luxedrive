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

// ─── Navbar Auth & Toggle ───────────────────────────────────────────────────
function setupNavbar() {
    const token = auth.getToken();
    const name  = localStorage.getItem('name');
    const role  = localStorage.getItem('role');
    const nav   = document.querySelector('nav');
    
    // 1. Create hamburger if not exists
    if (!document.querySelector('.hamburger')) {
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '<span></span><span></span><span></span>';
        nav.appendChild(hamburger);
        
        hamburger.onclick = () => {
            hamburger.classList.toggle('open');
            document.querySelector('.nav-links').classList.toggle('open');
        };
    }

    // 2. Dynamic nav links based on auth
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        let linksHtml = `<li><a href="/" id="link-home">Home</a></li>
                         <li><a href="/cars" id="link-cars">Fleet</a></li>
                         <li><a href="/contact" id="link-contact">Contact</a></li>`;
        
        if (token) {
            linksHtml += `<li><a href="/bookings" id="link-bookings">My Bookings</a></li>
                          ${role === 'admin' ? `<li><a href="/admin" id="link-admin">Admin Panel</a></li>` : ''}`;
        }
        navLinks.innerHTML = linksHtml;
    }

    // 3. Dynamic Auth buttons
    const navAuth = document.getElementById('nav-auth-btns');
    if (navAuth) {
        if (token) {
            navAuth.innerHTML = `
                <a href="/profile" id="link-profile" style="color:var(--primary-light); font-weight:700; display:flex; align-items:center; gap:5px;">
                   👤 ${name || 'User'}
                </a>
                <button onclick="auth.logout()" class="btn btn-outline btn-sm">Logout</button>
            `;
        } else {
            navAuth.innerHTML = `
                <a href="/login" class="btn btn-outline btn-sm">Login</a>
                <a href="/register" class="btn btn-primary btn-sm">Sign Up</a>
            `;
        }
    }

    // 4. Highlight active link
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a, .nav-btns a').forEach(link => {
        if (link.getAttribute('href') === path) link.classList.add('active');
    });
}

// ─── Homepage Featured Cars ─────────────────────────────────────────────────
async function fetchFeaturedCars() {
    const carGrid = document.getElementById('featured-cars');
    if (!carGrid) return;

    try {
        const response = await fetch(`${API_URL}/cars`);
        const cars = await response.json();

        if (!Array.isArray(cars) || cars.length === 0) {
            carGrid.innerHTML = '<p class="empty-state">No cars available right now.</p>';
            return;
        }

        carGrid.innerHTML = cars.slice(0, 3).map(car => `
            <div class="car-card">
                <img src="${car.image ? '/uploads/' + car.image : 'https://placehold.co/400x250/1e293b/white?text=' + encodeURIComponent(car.name)}"
                     alt="${car.name}" class="car-img"
                     onerror="this.src='https://placehold.co/400x250/1e293b/white?text=Car'">
                <div class="car-info">
                    <h3>${car.name}</h3>
                    <div class="car-price">$${car.price_per_day} <span>/ day</span></div>
                    <p class="car-desc">${car.description || ''}</p>
                    <a href="/dashboard" class="btn btn-primary btn-full">View Details</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('[Featured Cars Error]', error);
        carGrid.innerHTML = '<p class="empty-state">Failed to load cars.</p>';
    }
}

// ─── DOMContentLoaded Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupScrollReveal();
    setupNavbar();
    fetchFeaturedCars();
});
