// ===== Bijoux Deluxe - Script Principal =====
// Configuration
const CONFIG = {
    STRIPE_PUBLIC_KEY: 'pk_live_YOUR_PUBLIC_KEY_HERE'
};

const PRODUCTS = {
    'collier-gourmette-or': {
        name: 'Collier + Gourmette Or',
        price: 15,
        stripeLink: 'https://buy.stripe.com/00w8wO53n7At2GgfuweIw07'
    },
    'collier-or': {
        name: 'Collier Seul Or',
        price: 10,
        stripeLink: 'https://buy.stripe.com/cNi8wO67rcUNdkUbegeIw08'
    },
    'gourmette-or': {
        name: 'Gourmette Seule Or',
        price: 10,
        stripeLink: 'https://buy.stripe.com/00w5kC1Rb4oh2GggyAeIw09'
    },
    'collier-gourmette-argent': {
        name: 'Collier + Gourmette Argent',
        price: 15,
        stripeLink: 'https://buy.stripe.com/aFadR83Zjf2V94E6Y0eIw0a'
    },
    'collier-argent': {
        name: 'Collier Seul Argent',
        price: 10,
        stripeLink: 'https://buy.stripe.com/8x200ianH5sldkUcikeIw0b'
    },
    'gourmette-argent': {
        name: 'Gourmette Seule Argent',
        price: 10,
        stripeLink: 'https://buy.stripe.com/bJe28q67r3kd5Ss0zCeIw0c'
    }
};

let currentProduct = null;

// ===== Initialization =====
function init() {
    console.log('🎁 Bijoux Deluxe - Initializing...');
    setupBuyButtons();
    setupModalHandlers();
    setupSmoothScroll();
    setupAnimations();
    console.log('✅ Bijoux Deluxe - Ready!');
}

// ===== Buy Button Setup =====
function setupBuyButtons() {
    const buttons = document.querySelectorAll('.add-btn');
    if (buttons.length === 0) {
        console.warn('⚠️ No buy buttons found');
        return;
    }

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product');
            if (productId && PRODUCTS[productId]) {
                openModal(productId);
            }
        });
    });
}

// ===== Modal Functions =====
function openModal(productId) {
    currentProduct = { ...PRODUCTS[productId], id: productId };
    const modal = document.getElementById('personalizationModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('personalizationModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    currentProduct = null;
}

function setupModalHandlers() {
    const modal = document.getElementById('personalizationModal');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('personalizationForm');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ===== Form Submission =====
function handleFormSubmit(e) {
    e.preventDefault();

    const personalization = document.getElementById('personalization').value.trim();
    const email = document.getElementById('email').value.trim();
    const name = document.getElementById('name').value.trim();

    if (!personalization || !email || !name) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Email invalide', 'error');
        return;
    }

    if (!currentProduct || !currentProduct.stripeLink) {
        showNotification('Erreur: produit introuvable', 'error');
        return;
    }

    if (currentProduct.stripeLink.includes('YOUR_')) {
        showNotification('⚠️ Liens Stripe non configurés', 'warning');
        return;
    }

    // Redirect to Stripe
    const url = new URL(currentProduct.stripeLink);
    url.searchParams.append('client_reference_id', email);
    
    window.location.href = url.toString();
}

// ===== Email Validation =====
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== Notifications =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#FF6B6B' : type === 'warning' ? '#FFD700' : '#4CAF50'};
        color: ${type === 'warning' ? '#000' : '#fff'};
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        font-weight: 600;
        font-family: 'Montserrat', sans-serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// ===== Smooth Scroll =====
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ===== Animations =====
function setupAnimations() {
    // Fade in elements on scroll
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.animation = 'fadeInScale 0.6s ease-out';
                }
            });
        });

        document.querySelectorAll('.product-card, .gallery-item, .feature').forEach(el => {
            el.style.opacity = '0.9';
            observer.observe(el);
        });
    }
}

// ===== Start Application =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===== Global Export =====
window.BijouxDeluxe = { PRODUCTS, openModal, closeModal, showNotification };
