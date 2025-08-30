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

    // Setup image upload functionality
    setupImageUpload();

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
    const path = target.dataset.path;
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
        case 'delete-image':
            if (path) deleteImage(path);
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
    // Setup image upload
    const uploadBtn = document.getElementById('upload-images');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleImageUpload);
    }

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

function setupImageUpload() {
    const imageInput = document.getElementById('image-upload');
    const uploadBtn = document.getElementById('upload-images');

    if (imageInput && uploadBtn) {
        uploadBtn.addEventListener('click', handleImageUpload);
    }
}

async function handleImageUpload() {
    const imageInput = document.getElementById('image-upload');
    const imagesTab = document.getElementById('images-tab');

    if (!imageInput.files || imageInput.files.length === 0) {
        showMessage('Please select image files to upload.', 'error', imagesTab);
        return;
    }

    const files = Array.from(imageInput.files);

    // Validate all files first
    for (let file of files) {
        const validation = window.imageProcessor.validateImage(file);
        if (!validation.valid) {
            showMessage(`Invalid file ${file.name}: ${validation.errors.join(', ')}`, 'error', imagesTab);
            return;
        }
    }

    try {
        showMessage('Processing images...', 'info', imagesTab);

        const uploadResults = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = (i + 1) / files.length * 100;

            showMessage(`Uploading image ${i + 1} of ${files.length}... (${progress.toFixed(0)}%)`, 'info', imagesTab);

            const result = await uploadImageToGitHub(file);
            uploadResults.push({ file: file, success: result.success, path: result.path });
        }

        const successful = uploadResults.filter(r => r.success).length;
        const total = files.length;

        if (successful > 0) {
            showMessage(`Successfully uploaded ${successful} of ${total} images.`, 'success', imagesTab);
            // Refresh images display
            loadImages();
        } else {
            showMessage('Failed to upload any images.', 'error', imagesTab);
        }

        // Clear input
        imageInput.value = '';

    } catch (error) {
        console.error('Error handling image upload:', error);
        showMessage('An error occurred during upload. Please check console for details.', 'error', imagesTab);
    }
}

async function uploadImageToGitHub(file) {
    try {
        // Process the image using image-processor.js
        const processedResult = await window.imageProcessor.processImage(file);
        if (!processedResult.success) {
            return { success: false, error: processedResult.error };
        }

        // Generate thumbnail
        const thumbnailResult = await window.imageProcessor.generateThumbnail(processedResult.url);

        if (!thumbnailResult) {
            return { success: false, error: 'Failed to generate thumbnail' };
        }

        // Create filename with timestamp to avoid conflicts
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;

        // Upload main image
        const mainImagePath = `assets/images/large/${filename}`;
        const mainImageResult = await window.githubApi.uploadBinaryFile(
            mainImagePath,
            processedResult.processedBlob,
            `Admin: Uploaded image - ${file.name}`
        );

        if (!mainImageResult.success) {
            return { success: false, error: 'Failed to upload main image' };
        }

        // Upload thumbnail
        const thumbnailPath = `assets/images/thumbnails/${filename}`;
        const thumbnailImageResult = await window.githubApi.uploadBinaryFile(
            thumbnailPath,
            thumbnailResult.blob,
            `Admin: Uploaded thumbnail - ${file.name}`
        );

        // Return success even if thumbnail fails (main image is more important)
        return {
            success: mainImageResult.success,
            path: mainImagePath,
            thumbnailPath: thumbnailPath
        };

    } catch (error) {
        console.error('Error in uploadImageToGitHub:', error);
        return { success: false, error: error.message };
    }
}

async function handleArtistFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const artistData = {
        name: formData.get('name'),
        bio: formData.get('bio'),
        website: formData.get('website') || null,
        id: formData.get('id') || Date.now().toString()
    };

    try {
        // Save artist via GitHub API
        const success = await saveArtist(artistData);

        if (success) {
            // Close modal and refresh list
            closeModal();
            loadArtists();
            showMessage('Artist saved successfully!', 'success', document.getElementById('artists-tab'));
        } else {
            showMessage('Failed to save artist. Please try again.', 'error', document.getElementById('artists-tab'));
        }
    } catch (error) {
        console.error('Error saving artist:', error);
        showMessage('An error occurred while saving. Please check console for details.', 'error', document.getElementById('artists-tab'));
    }
}

// Save artist data to GitHub
async function saveArtist(newArtist) {
    try {
        // Get current artists data
        const response = await fetch('assets/data/artists.json');
        const data = await response.json();
        const artists = data.artists || [];

        // Check if we're updating or creating
        const existingIndex = artists.findIndex(artist => artist.id === newArtist.id);

        if (existingIndex >= 0) {
            // Update existing artist
            artists[existingIndex] = { ...artists[existingIndex], ...newArtist };
        } else {
            // Add new artist
            artists.push(newArtist);
        }

        // Update the data
        const updatedData = { ...data, artists: artists };
        const jsonContent = JSON.stringify(updatedData, null, 2);

        // Get current SHA of the file
        const fileContent = await window.githubApi.getFileContent('assets/data/artists.json');
        const fileSha = fileContent.success ? fileContent.sha : null;

        // Commit message
        const action = existingIndex >= 0 ? 'Updated' : 'Added';
        const commitMessage = `Admin: ${action} artist - ${newArtist.name}`;

        // Save to GitHub
        const result = await window.githubApi.createOrUpdateFile(
            'assets/data/artists.json',
            jsonContent,
            commitMessage,
            fileSha
        );

        return result.success;

    } catch (error) {
        console.error('Error in saveArtist:', error);
        return false;
    }
}

// Helper to get file SHA for updates
async function getFileSha(path) {
    try {
        const result = await window.githubApi.getFileContent(path);
        return result.success ? result.sha : null;
    } catch (error) {
        console.error('Error getting file SHA:', error);
        return null;
    }
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

async function deleteArtist(id) {
    if (confirm('Are you sure you want to delete this artist?')) {
        try {
            const success = await removeArtistFromGitHub(id);

            if (success) {
                showMessage('Artist deleted successfully!', 'success', document.getElementById('artists-tab'));
                loadArtists();
            } else {
                showMessage('Failed to delete artist. Please try again.', 'error', document.getElementById('artists-tab'));
            }
        } catch (error) {
            console.error('Error deleting artist:', error);
            showMessage('An error occurred while deleting. Please check console for details.', 'error', document.getElementById('artists-tab'));
        }
    }
}

async function removeArtistFromGitHub(artistId) {
    try {
        // Get current artists data
        const response = await fetch('assets/data/artists.json');
        const data = await response.json();
        const artists = data.artists || [];

        // Find and remove the artist
        const updatedArtists = artists.filter(artist => artist.id !== artistId);

        // If no changes, artist wasn't found
        if (updatedArtists.length === artists.length) {
            return false;
        }

        // Find artist name for commit message
        const deletedArtist = artists.find(artist => artist.id === artistId);
        const artistName = deletedArtist ? deletedArtist.name : 'Unknown artist';

        // Update the data
        const updatedData = { ...data, artists: updatedArtists };
        const jsonContent = JSON.stringify(updatedData, null, 2);

        // Get current SHA of the file and commit
        const fileSha = await getFileSha('assets/data/artists.json');
        const commitMessage = `Admin: Deleted artist - ${artistName}`;

        const result = await window.githubApi.createOrUpdateFile(
            'assets/data/artists.json',
            jsonContent,
            commitMessage,
            fileSha
        );

        return result.success;

    } catch (error) {
        console.error('Error in removeArtistFromGitHub:', error);
        return false;
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
    const imagesContainer = document.getElementById('images-grid');
    if (!imagesContainer) return;

    imagesContainer.innerHTML = '<div class="loading">Loading images...</div>';

    try {
        // Get list of images from the thumbnails directory
        const imagesList = await getImagesList();

        if (imagesList.length === 0) {
            imagesContainer.innerHTML = '<div class="loading">No images found. Upload some images to get started.</div>';
            return;
        }

        let html = '';
        imagesList.forEach(image => {
            html += `
                <div class="image-item">
                    <img src="${image.thumbnailUrl}" alt="${image.name}" loading="lazy">
                    <div class="image-info">
                        <p>${image.name}</p>
                        <small>${image.size}</small>
                    </div>
                    <div class="image-actions">
                        <button class="delete-btn" data-action="delete-image" data-path="${image.path}">Delete</button>
                    </div>
                </div>
            `;
        });

        imagesContainer.innerHTML = html;

    } catch (error) {
        console.error('Error loading images:', error);
        imagesContainer.innerHTML = '<div class="loading error">Failed to load images. Please check your connection.</div>';
    }
}

async function getImagesList() {
    try {
        // Use GitHub API to get contents of thumbnails directory
        const response = await window.githubApi.githubApiCall(`/repos/${window.githubApi.getRepoPath()}/contents/assets/images/thumbnails`);
        const data = await response.json();

        // Filter only image files
        const images = data.filter(item => {
            if (item.type !== 'file') return false;
            const ext = item.name.toLowerCase().split('.').pop();
            return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        });

        return images.map(item => ({
            name: item.name,
            path: item.path,
            thumbnailUrl: `https://raw.githubusercontent.com/${window.githubApi.getRepoPath()}/main/${item.path}`,
            fullUrl: `https://raw.githubusercontent.com/${window.githubApi.getRepoPath()}/main/assets/images/large/${item.name}`,
            size: window.imageProcessor.formatFileSize(item.size),
            sha: item.sha
        }));

    } catch (error) {
        console.error('Error getting images list:', error);

        // If API fails, try to load locally (fallback)
        if (error.message.includes('fetch')) {
            return await getLocalImagesList();
        }

        return [];
    }
}

async function getLocalImagesList() {
    // Fallback - list what's available locally
    // This is a simplified version, in real implementation you'd scan the directory
    return [];
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

async function deleteImage(imagePath) {
    if (confirm('Are you sure you want to delete this image? This cannot be undone.')) {
        try {
            showMessage('Deleting image...', 'info', document.getElementById('images-tab'));

            // Get filename from path
            const filename = imagePath.split('/').pop();

            // Delete thumbnail
            const thumbnailPath = imagePath;
            let thumbnailSuccess = true;
            try {
                const thumbnailSha = await getFileSha(thumbnailPath);
                if (thumbnailSha) {
                    await window.githubApi.githubApiCall(`/repos/${window.githubApi.getRepoPath()}/contents/${thumbnailPath}`, {
                        method: 'DELETE',
                        body: JSON.stringify({
                            message: `Admin: Deleted image thumbnail - ${filename}`,
                            sha: thumbnailSha
                        })
                    });
                }
            } catch (error) {
                console.error('Error deleting thumbnail:', error);
                thumbnailSuccess = false;
            }

            // Delete full image
            const fullImagePath = `assets/images/large/${filename}`;
            let fullImageSuccess = true;
            try {
                const fullImageSha = await getFileSha(fullImagePath);
                if (fullImageSha) {
                    await window.githubApi.githubApiCall(`/repos/${window.githubApi.getRepoPath()}/contents/${fullImagePath}`, {
                        method: 'DELETE',
                        body: JSON.stringify({
                            message: `Admin: Deleted full image - ${filename}`,
                            sha: fullImageSha
                        })
                    });
                }
            } catch (error) {
                console.error('Error deleting full image:', error);
                fullImageSuccess = false;
            }

            if (thumbnailSuccess || fullImageSuccess) {
                showMessage('Image deleted successfully!', 'success', document.getElementById('images-tab'));
                // Refresh images display
                loadImages();
            } else {
                showMessage('Failed to delete image. Please try again.', 'error', document.getElementById('images-tab'));
            }

        } catch (error) {
            console.error('Error in deleteImage:', error);
            showMessage('An error occurred while deleting. Please check console for details.', 'error', document.getElementById('images-tab'));
        }
    }
}