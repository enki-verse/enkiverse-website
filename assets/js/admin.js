// ENKIVERSE Foundation - Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Check if user is authenticated
    const token = sessionStorage.getItem('enkiverse_github_token');

    if (!token) {
        // Show login overlay
        showLoginForm();
    } else {
        // Validate token and proceed
        authenticateAndLoad(token);

        // Setup admin functionality
        setupAdminInterface();
    }
}

function showLoginForm() {
    const overlay = document.getElementById('login-overlay');
    const form = document.getElementById('admin-login');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const token = form.querySelector('input[type="password"]').value;

        if (token) {
            authenticateAndLoad(token);
        }
    });
}

async function authenticateAndLoad(token) {
    // Validate token with GitHub API
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            // Authentication successful
            sessionStorage.setItem('enkiverse_github_token', token);

            // Hide login overlay
            document.getElementById('login-overlay').classList.add('hidden');

            // Load admin data
            loadAdminData();
        } else {
            throw new Error('Invalid token');
        }
    } catch (error) {
        console.error('Authentication failed:', error);
        showMessage('Invalid GitHub token. Please check your credentials.', 'error',
            document.getElementById('admin-login'));
    }
}

function setupAdminInterface() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;

            // Update active tab
            tabBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId + '-tab').classList.add('active');

            // Load tab data
            loadTabData(tabId);
        });
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('enkiverse_github_token');
            location.reload();
        });
    }
}

function loadAdminData() {
    // Load data for all tabs
    loadTabData('artists');
}

function loadTabData(tabName) {
    const token = sessionStorage.getItem('enkiverse_github_token');

    switch (tabName) {
        case 'artists':
            loadArtists();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'events':
            loadEvents();
            break;
        case 'images':
            loadImages();
            break;
    }
}

async function loadArtists() {
    try {
        const response = await fetch('assets/data/artists.json');
        const data = await response.json();

        renderArtistsList(data.artists || []);
    } catch (error) {
        console.error('Error loading artists:', error);
    }
}

async function loadProjects() {
    try {
        const response = await fetch('assets/data/projects.json');
        const data = await response.json();

        renderProjectsList(data.projects || []);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadEvents() {
    try {
        const response = await fetch('assets/data/events.json');
        const data = await response.json();

        renderEventsList(data.events || []);
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

async function loadImages() {
    // Placeholder for image management
    const imagesContainer = document.getElementById('images-grid');
    if (imagesContainer) {
        imagesContainer.innerHTML = '<div class="loading">Image management coming soon...</div>';
    }
}

function renderArtistsList(artists) {
    const container = document.querySelector('#artists-tab .content-list');

    if (artists.length === 0) {
        container.innerHTML = '<div class="loading">No artists found. Click "Add Artist" to get started.</div>';
        return;
    }

    let html = '';
    artists.forEach(artist => {
        html += `
            <div class="artist-item">
                <img src="assets/images/thumbnails/${artist.images?.[0] || 'placeholder.jpg'}" alt="${artist.name}" loading="lazy">
                <div class="artist-info">
                    <h4>${artist.name}</h4>
                    <p>${artist.bio || 'No bio available'}</p>
                </div>
                <div class="content-actions">
                    <button class="edit-btn" data-action="edit-artist" data-id="${artist.id}">Edit</button>
                    <button class="delete-btn" data-action="delete-artist" data-id="${artist.id}">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderProjectsList(projects) {
    const container = document.querySelector('#projects-tab .content-list');

    if (projects.length === 0) {
        container.innerHTML = '<div class="loading">No projects found. Click "Add Project" to get started.</div>';
        return;
    }

    let html = '';
    projects.forEach(project => {
        html += `
            <div class="project-item">
                <img src="assets/images/thumbnails/${project.images?.[0] || 'placeholder.jpg'}" alt="${project.title}" loading="lazy">
                <div class="project-info">
                    <h4>${project.title}</h4>
                    <p>${project.description || 'No description available'}</p>
                </div>
                <div class="content-actions">
                    <button class="edit-btn" data-action="edit-project" data-id="${project.id}">Edit</button>
                    <button class="delete-btn" data-action="delete-project" data-id="${project.id}">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderEventsList(events) {
    const container = document.querySelector('#events-tab .content-list');

    if (events.length === 0) {
        container.innerHTML = '<div class="loading">No events found. Click "Add Event" to get started.</div>';
        return;
    }

    let html = '';
    events.forEach(event => {
        html += `
            <div class="event-item">
                <div class="event-info">
                    <h4>${event.title || 'Untitled Event'}</h4>
                    <p>${event.description || 'No description available'}</p>
                </div>
                <div class="content-actions">
                    <button class="edit-btn" data-action="edit-event" data-id="${event.id}">Edit</button>
                    <button class="delete-btn" data-action="delete-event" data-id="${event.id}">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function showMessage(message, type, container) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}