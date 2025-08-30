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

    // Event delegation for dynamic buttons
    document.addEventListener('click', handleButtonClick);

    // Setup form submissions
    setupForms();

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('enkiverse_github_token');
            location.reload();
        });
    }
}

function handleButtonClick(e) {
    const target = e.target;
    const action = target.dataset.action;
    const id = target.dataset.id;
    const tab = target.closest('.tab-content')?.id?.replace('-tab', '');

    if (!action) return;

    switch (action) {
        case 'add-artist':
            showArtistModal();
            break;
        case 'edit-artist':
            if (id) editArtist(id);
            break;
        case 'delete-artist':
            if (id) deleteArtist(id);
            break;
        case 'add-project':
            showProjectModal();
            break;
        case 'edit-project':
            if (id) editProject(id);
            break;
        case 'delete-project':
            if (id) deleteProject(id);
            break;
        case 'add-event':
            showEventModal();
            break;
        case 'edit-event':
            if (id) editEvent(id);
            break;
        case 'delete-event':
            if (id) deleteEvent(id);
            break;
        default:
            console.log('Unknown action:', action);
    }
}

function setupForms() {
    // Artist form
    const artistForm = document.getElementById('artist-form');
    if (artistForm) {
        artistForm.addEventListener('submit', handleArtistFormSubmit);
    }

    // Close modal buttons
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Click outside modal to close
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

function handleArtistFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const artistData = {
        name: formData.get('name'),
        bio: formData.get('bio'),
        website: formData.get('website') || null,
        id: formData.get('id') || Date.now().toString()
    };

    // Here you would call a function to save the artist via GitHub API
    console.log('Artist data:', artistData);

    // Close modal and refresh list
    closeModal();
    loadArtists();

    showMessage('Artist saved successfully!', 'success', document.getElementById('artists-tab'));
}

function showArtistModal(artist = null) {
    const modal = document.getElementById('artist-modal');
    const form = document.getElementById('artist-form');
    const title = document.getElementById('artist-modal-title');

    if (artist) {
        // Edit mode
        title.textContent = 'Edit Artist';
        form.querySelector('#artist-name').value = artist.name || '';
        form.querySelector('#artist-bio').value = artist.bio || '';
        form.querySelector('#artist-website').value = artist.website || '';
        // Add hidden input for ID
        let idInput = form.querySelector('input[name="id"]');
        if (!idInput) {
            idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.name = 'id';
            form.appendChild(idInput);
        }
        idInput.value = artist.id;
    } else {
        // Add mode
        title.textContent = 'Add Artist';
        form.reset();
    }

    modal.style.display = 'block';
}

function editArtist(id) {
    // Find artist by id and show modal
    const artists = JSON.parse(sessionStorage.getItem('current_artists') || '[]');
    const artist = artists.find(a => a.id == id);
    if (artist) {
        showArtistModal(artist);
    }
}

function deleteArtist(id) {
    if (confirm('Are you sure you want to delete this artist?')) {
        console.log('Deleting artist:', id);
        // Here you would call a function to delete via GitHub API
        showMessage('Artist deleted successfully!', 'success', document.getElementById('artists-tab'));
        loadArtists();
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Placeholder functions for other entities
function showProjectModal() {
    alert('Project modal not implemented yet');
}

function editProject(id) {
    alert('Edit project not implemented yet');
}

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        showMessage('Project deleted successfully!', 'success', document.getElementById('projects-tab'));
        loadProjects();
    }
}

function showEventModal() {
    alert('Event modal not implemented yet');
}

function editEvent(id) {
    alert('Edit event not implemented yet');
}

function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        showMessage('Event deleted successfully!', 'success', document.getElementById('events-tab'));
        loadEvents();
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
        const artists = data.artists || [];

        // Store artists data for editing
        sessionStorage.setItem('current_artists', JSON.stringify(artists));

        renderArtistsList(artists);
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