// ENKIVERSE Foundation - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize site
    initializeSite();

    // Load JSON data if needed
    loadInitialData();
});

function initializeSite() {
    // Mobile navigation toggle
    setupMobileNavigation();

    // Email signup forms
    setupEmailSignups();

    // Scroll effects
    setupScrollEffects();
}

function setupMobileNavigation() {
    // Create mobile menu toggle
    const navContainer = document.querySelector('.nav-container');
    if (window.innerWidth <= 768) {
        const navToggle = document.createElement('div');
        navToggle.className = 'nav-toggle';
        navToggle.innerHTML = '<span></span><span></span><span></span>';
        navToggle.addEventListener('click', toggleMobileMenu);

        navContainer.insertBefore(navToggle, navContainer.children[1]);
    }
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

function setupEmailSignups() {
    const signupForms = document.querySelectorAll('.signup-form');

    signupForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = this.querySelector('input[type="email"]').value;
            const name = this.querySelector('input[name="name"]') ?
                this.querySelector('input[name="name"]').value : '';

            if (validateEmail(email)) {
                submitEmailSignup(email, name, this);
            } else {
                showMessage('Please enter a valid email address.', 'error', this);
            }
        });
    });
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function submitEmailSignup(email, name, form) {
    // Send to Mailchimp or other service
    // For now, just log and show success message
    console.log('Email signup:', email, name);

    showMessage('Thank you for subscribing! We\'ll keep you updated.', 'success', form);

    // Clear form
    form.reset();
}

function showMessage(message, type, container) {
    // Remove existing messages
    const existingMessage = container.querySelector('.message');
    if (existingMessage) existingMessage.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    container.insertBefore(messageDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function setupScrollEffects() {
    const navbar = document.querySelector('header nav');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function loadInitialData() {
    // Load artists data for artists page
    if (document.querySelector('#artists-list')) {
        loadArtistsData();
    }

    // Load projects data for projects page
    if (document.querySelector('#projects-list')) {
        loadProjectsData();
    }

    // Load config data
    loadSiteConfig();
}

function loadArtistsData() {
    fetch('assets/data/artists.json')
        .then(response => response.json())
        .then(data => {
            renderArtists(data.artists);
        })
        .catch(error => {
            console.error('Error loading artists data:', error);
        });
}

function loadProjectsData() {
    fetch('assets/data/projects.json')
        .then(response => response.json())
        .then(data => {
            renderProjects(data.projects);
        })
        .catch(error => {
            console.error('Error loading projects data:', error);
        });
}

function loadSiteConfig() {
    fetch('assets/data/config.json')
        .then(response => response.json())
        .then(data => {
            // Make config available globally
            window.siteConfig = data.site;
        })
        .catch(error => {
            console.error('Error loading site config:', error);
        });
}

function renderArtists(artists) {
    const container = document.querySelector('#additional-artists');
    if (!container) return;

    // Additional artists rendering would go here
    // For now, just log the data
    console.log('Artists data loaded:', artists);
}

function renderProjects(projects) {
    const container = document.querySelector('#additional-projects');
    if (!container) return;

    // Additional projects rendering would go here
    // For now, just log the data
    console.log('Projects data loaded:', projects);
}

// Utility functions
function getCurrentPath() {
    return window.location.pathname;
}

function isHomePage() {
    return getCurrentPath() === '/' || getCurrentPath().endsWith('index.html');
}