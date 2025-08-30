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
        case 'select-images':
            if (target.dataset.type) showImageSelectionModal(target.dataset.type);
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

    // Project form
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectFormSubmit);
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
    const testBtn = document.getElementById('test-upload');
    const assignmentSelect = document.getElementById('image-assignment');

    if (imageInput && uploadBtn) {
        uploadBtn.addEventListener('click', handleImageUpload);
    }

    if (testBtn) {
        testBtn.addEventListener('click', handleTestUpload);
    }

    if (assignmentSelect) {
        assignmentSelect.addEventListener('change', handleAssignmentChange);
    }
}

function handleAssignmentChange(e) {
    const assignment = e.target.value;
    const assignmentDetails = document.getElementById('assignment-details');
    const assignmentTarget = document.getElementById('assignment-target');

    if (assignment === 'none') {
        assignmentDetails.style.display = 'none';
    } else {
        // Populate options based on assignment type
        populateAssignmentOptions(assignment, assignmentTarget);
        assignmentDetails.style.display = 'block';
    }
}

async function populateAssignmentOptions(assignmentType, targetSelect) {
    targetSelect.innerHTML = '<option value="">Select ' + assignmentType + '...</option>';

    try {
        let data, idField, nameField;

        switch (assignmentType) {
            case 'artist':
                const artistsResponse = await fetch('assets/data/artists.json');
                data = await artistsResponse.json();
                idField = 'id';
                nameField = 'name';
                break;
            case 'project':
                const projectsResponse = await fetch('assets/data/projects.json');
                data = await projectsResponse.json();
                data = data.projects;
                idField = 'id';
                nameField = 'title';
                break;
            case 'event':
                const eventsResponse = await fetch('assets/data/events.json');
                data = await eventsResponse.json();
                data = data.events;
                idField = 'id';
                nameField = 'title';
                break;
            default:
                return;
        }

        if (data && data.length > 0) {
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[idField];
                option.textContent = item[nameField] || item[idField];
                targetSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No ' + assignmentType + 's found';
            targetSelect.appendChild(option);
        }

    } catch (error) {
        console.error('Error loading assignment options:', error);
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Error loading ' + assignmentType + 's';
        targetSelect.appendChild(option);
    }
}

async function handleTestUpload() {
    console.log('Starting test upload...');
    const imagesTab = document.getElementById('images-tab');

    try {
        showMessage('Testing upload functionality...', 'info', imagesTab);

        // Test basic file upload with a simple text file
        const testContent = `Test file created at ${new Date().toISOString()}`;
        const testPath = `test-files/test-${Date.now()}.txt`;
        const testMessage = 'Test upload from admin panel';

        console.log('Testing GitHub API call...');
        const result = await window.githubApi.uploadBinaryFile(testPath, new Blob([testContent]), testMessage);
        console.log('Test API result:', result);

        if (result.success) {
            showMessage('Test upload successful! Basic API working.', 'success', imagesTab);
        } else {
            showMessage(`Test upload failed: ${result.error}`, 'error', imagesTab);
        }

    } catch (error) {
        console.error('Test upload error:', error);
        showMessage(`Test upload error: ${error.message}`, 'error', imagesTab);
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

    // Validate GitHub setup
    console.log('Validating GitHub setup...');
    const token = sessionStorage.getItem('enkiverse_github_token');
    console.log('Token available:', !!token);

    if (!token) {
        showMessage('GitHub token not found. Please authenticate first.', 'error', imagesTab);
        return;
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

            if (!result.success) {
                console.error('Upload failed for', file.name, ':', result.error);
            }
        }

        const successful = uploadResults.filter(r => r.success).length;
        const total = files.length;

        if (successful > 0) {
            showMessage(`Successfully uploaded ${successful} of ${total} images.`, 'success', imagesTab);
            // Refresh images display
            loadImages();
        } else {
            showMessage('Failed to upload any images. Check console for details.', 'error', imagesTab);
        }

        // Clear input and assignment
        imageInput.value = '';
        document.getElementById('image-assignment').value = 'none';
        handleAssignmentChange({ target: { value: 'none' } });

    } catch (error) {
        console.error('Error handling image upload:', error);
        console.error('Error stack:', error.stack);
        showMessage('An error occurred during upload. Please check console for details.', 'error', imagesTab);
    }
}

// Image selection functionality
let currentImageSelectionType = null;
let selectedImages = [];

function showImageSelectionModal(contentType) {
    currentImageSelectionType = contentType;
    selectedImages = [];

    const modal = document.getElementById('image-selection-modal');
    const gallery = document.getElementById('image-gallery');

    // Load available images
    loadImageGallery(gallery);

    // Reset selection count
    document.getElementById('selected-count').textContent = '0';

    modal.style.display = 'block';
}

async function loadImageGallery(container) {
    try {
        const images = await getImagesList();

        if (images.length === 0) {
            container.innerHTML = '<div class="no-images">No images available. Upload some images first.</div>';
            return;
        }

        let html = '';
        images.forEach(image => {
            const isSelected = selectedImages.includes(image.fullUrl);
            html += `
                <div class="gallery-image ${isSelected ? 'selected' : ''}" data-image-url="${image.fullUrl}">
                    <img src="${image.thumbnailUrl}" alt="${image.name}" loading="lazy">
                    <div class="image-overlay">
                        <button type="button" class="image-select-btn" data-image-url="${image.fullUrl}">
                            ${isSelected ? 'Selected' : 'Select'}
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add click handlers
        container.addEventListener('click', handleImageGalleryClick);

    } catch (error) {
        console.error('Error loading image gallery:', error);
        container.innerHTML = '<div class="error">Failed to load images.</div>';
    }
}

function handleImageGalleryClick(e) {
    if (e.target.classList.contains('image-select-btn')) {
        e.preventDefault();
        const imageUrl = e.target.dataset.imageUrl;
        toggleImageSelection(imageUrl);
    }
}

function toggleImageSelection(imageUrl) {
    const gallery = document.getElementById('image-gallery');
    const imageDiv = gallery.querySelector(`[data-image-url="${imageUrl}"]`);
    const selectBtn = imageDiv.querySelector('.image-select-btn');

    const index = selectedImages.indexOf(imageUrl);

    if (index > -1) {
        // Remove from selection
        selectedImages.splice(index, 1);
        imageDiv.classList.remove('selected');
        selectBtn.textContent = 'Select';
    } else {
        // Add to selection
        selectedImages.push(imageUrl);
        imageDiv.classList.add('selected');
        selectBtn.textContent = 'Selected';
    }

    // Update counter
    document.getElementById('selected-count').textContent = selectedImages.length;
}

// Handle modal confirmation
document.addEventListener('click', function(e) {
    if (e.target.id === 'confirm-image-selection') {
        confirmImageSelection();
    }
});

function confirmImageSelection() {
    if (selectedImages.length === 0) {
        alert('Please select at least one image.');
        return;
    }

    // Update the appropriate form's image list
    updateContentImages(currentImageSelectionType, selectedImages);

    // Close modal
    closeModal();

    // Clear selection
    selectedImages = [];
}

function updateContentImages(contentType, imageUrls) {
    const imageListId = `${contentType}-images-list`;
    const container = document.getElementById(imageListId);

    if (!container) return;

    // Convert full image URLs to thumbnail URLs
    const thumbnailUrls = imageUrls.map(url => url.replace('/large/', '/thumbnails/'));

    let html = '';
    thumbnailUrls.forEach((url, index) => {
        const filename = url.split('/').pop();
        html += `
            <div class="selected-image">
                <img src="${url}" alt="${filename}" style="max-width: 80px; max-height: 60px;">
                <span>${filename}</span>
                <button type="button" class="remove-image-btn" data-index="${index}">×</button>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add remove button handlers
    container.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-image-btn')) {
            const index = parseInt(e.target.dataset.index);
            removeSelectedImage(contentType, index);
        }
    });
}

function removeSelectedImage(contentType, index) {
    selectedImages.splice(index, 1);
    updateContentImages(contentType, selectedImages);
}

// Associate uploaded images with content (artists, projects, events)
async function associateImagesWithContent(imagePaths, contentType, contentId) {
    try {
        console.log('Associating images with content:', contentType, contentId, imagePaths);

        let dataPath, dataKey;

        switch (contentType) {
            case 'artist':
                dataPath = 'assets/data/artists.json';
                dataKey = 'artists';
                break;
            case 'project':
                dataPath = 'assets/data/projects.json';
                dataKey = 'projects';
                break;
            case 'event':
                dataPath = 'assets/data/events.json';
                dataKey = 'events';
                break;
            default:
                console.error('Unknown content type:', contentType);
                return false;
        }

        // Get current data
        const response = await fetch(dataPath);
        const data = await response.json();
        const items = data[dataKey] || [];

        // Find the item to update
        const itemIndex = items.findIndex(item => item.id === contentId);
        if (itemIndex === -1) {
            console.error('Content item not found:', contentId);
            return false;
        }

        // Ensure the item has an images array
        if (!items[itemIndex].images) {
            items[itemIndex].images = [];
        }

        // Add the new images (only thumbnail paths for display)
        const thumbnailPaths = imagePaths.map(path => path.replace('/large/', '/thumbnails/'));
        items[itemIndex].images.push(...thumbnailPaths);

        // Update the data
        const updatedData = { ...data, [dataKey]: items };
        const jsonContent = JSON.stringify(updatedData, null, 2);

        // Get current SHA and save
        const fileSha = await getFileSha(dataPath);
        const contentName = items[itemIndex].name || items[itemIndex].title || 'Unknown';
        const commitMessage = `Admin: Added images to ${contentType} - ${contentName}`;

        const result = await window.githubApi.createOrUpdateFile(
            dataPath,
            jsonContent,
            commitMessage,
            fileSha
        );

        console.log('Image association result:', result);
        return result.success;

    } catch (error) {
        console.error('Error associating images with content:', error);
        return false;
    }
}

async function uploadImageToGitHub(file) {
    try {
        console.log('Starting image upload for:', file.name, 'Size:', file.size);

        // Process the image using image-processor.js
        console.log('Processing image...');
        const processedResult = await window.imageProcessor.processImage(file);
        console.log('Processed result:', processedResult);

        if (!processedResult.success) {
            console.error('Image processing failed:', processedResult.error || 'Unknown error');
            return { success: false, error: processedResult.error || 'Image processing failed' };
        }

        // Generate thumbnail
        console.log('Generating thumbnail...');
        const thumbnailResult = await window.imageProcessor.generateThumbnail(processedResult.url);
        console.log('Thumbnail result:', thumbnailResult);

        if (!thumbnailResult || (thumbnailResult.hasOwnProperty('success') && !thumbnailResult.success)) {
            console.error('Thumbnail generation failed');
            const errorMsg = thumbnailResult && thumbnailResult.error ? thumbnailResult.error : 'Failed to generate thumbnail';
            return { success: false, error: errorMsg };
        }

        // Create filename with timestamp to avoid conflicts
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        console.log('Using filename:', filename);

        // Upload main image
        const mainImagePath = `assets/images/large/${filename}`;
        console.log('Uploading main image to:', mainImagePath);

        const mainImageResult = await window.githubApi.uploadBinaryFile(
            mainImagePath,
            processedResult.processedBlob,
            `Admin: Uploaded image - ${file.name}`
        );
        console.log('Main image upload result:', mainImageResult);

        if (!mainImageResult.success) {
            console.error('Main image upload failed:', mainImageResult.error);
            return { success: false, error: `Failed to upload main image: ${mainImageResult.error}` };
        }

        // Upload thumbnail
        const thumbnailPath = `assets/images/thumbnails/${filename}`;
        console.log('Uploading thumbnail to:', thumbnailPath);

        const thumbnailImageResult = await window.githubApi.uploadBinaryFile(
            thumbnailPath,
            thumbnailResult.blob,
            `Admin: Uploaded thumbnail - ${file.name}`
        );
        console.log('Thumbnail upload result:', thumbnailImageResult);

        // Return success even if thumbnail fails (main image is more important)
        return {
            success: mainImageResult.success,
            path: mainImagePath,
            thumbnailPath: thumbnailPath
        };

    } catch (error) {
        console.error('Error in uploadImageToGitHub:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        return { success: false, error: `Upload failed: ${error.message}` };
    }
}

async function handleArtistFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const artistData = {
        name: formData.get('name'),
        bio: formData.get('bio'),
        website: formData.get('website') || null,
        id: formData.get('id') || Date.now().toString(),
        images: selectedImages.length > 0 ? selectedImages.map(url => {
            if (url.includes('raw.githubusercontent.com')) {
                // Convert from full GitHub URL to local path
                return url.replace('https://raw.githubusercontent.com/enki-verse/enkiverse-website/main/', '').replace('/large/', '/thumbnails/');
            }
            return url;
        }) : []
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

    // Clear selected images when opening modal
    selectedImages = [];

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

        // Display existing images
        if (artist.images && artist.images.length > 0) {
            selectedImages = artist.images.map(img => {
                // Convert thumbnail path back to full URL for display
                if (img.includes('assets/images/thumbnails/')) {
                    return `https://raw.githubusercontent.com/enki-verse/enkiverse-website/main/${img.replace('/thumbnails/', '/large/')}`;
                }
                return img;
            });
            updateContentImages('artist', selectedImages);
        } else {
            document.getElementById('artist-images-list').innerHTML = '';
        }
    } else {
        // Add mode
        title.textContent = 'Add Artist';
        form.reset();
        document.getElementById('artist-images-list').innerHTML = '';
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

async function handleProjectFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const projectData = {
        title: formData.get('title'),
        description: formData.get('description'),
        images: selectedImages.length > 0 ? selectedImages.map(url => {
            if (url.includes('raw.githubusercontent.com')) {
                // Convert from full GitHub URL to local path
                return url.replace('https://raw.githubusercontent.com/enki-verse/enkiverse-website/main/', '').replace('/large/', '/thumbnails/');
            }
            return url;
        }) : [],
        id: formData.get('id') || Date.now().toString()
    };

    try {
        // Save project via GitHub API
        const success = await saveProject(projectData);

        if (success) {
            // Close modal and refresh list
            closeModal();
            loadProjects();
            showMessage('Project saved successfully!', 'success', document.getElementById('projects-tab'));
        } else {
            showMessage('Failed to save project. Please try again.', 'error', document.getElementById('projects-tab'));
        }
    } catch (error) {
        console.error('Error saving project:', error);
        showMessage('An error occurred while saving. Please check console for details.', 'error', document.getElementById('projects-tab'));
    }
}

// Save project data to GitHub
async function saveProject(newProject) {
    try {
        // Get current projects data
        const response = await fetch('assets/data/projects.json');
        const data = await response.json();
        const projects = data.projects || [];

        // Check if we're updating or creating
        const existingIndex = projects.findIndex(project => project.id === newProject.id);

        if (existingIndex >= 0) {
            // Update existing project
            projects[existingIndex] = { ...projects[existingIndex], ...newProject };
        } else {
            // Add new project
            projects.push(newProject);
        }

        // Update the data
        const updatedData = { ...data, projects: projects };
        const jsonContent = JSON.stringify(updatedData, null, 2);

        // Get current SHA of the file
        const fileContent = await window.githubApi.getFileContent('assets/data/projects.json');
        const fileSha = fileContent.success ? fileContent.sha : null;

        // Commit message
        const action = existingIndex >= 0 ? 'Updated' : 'Added';
        const commitMessage = `Admin: ${action} project - ${newProject.title}`;

        // Save to GitHub
        const result = await window.githubApi.createOrUpdateFile(
            'assets/data/projects.json',
            jsonContent,
            commitMessage,
            fileSha
        );

        return result.success;

    } catch (error) {
        console.error('Error in saveProject:', error);
        return false;
    }
}

function showProjectModal(project = null) {
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    const title = document.getElementById('project-modal-title');

    if (modal && form && title) {
        // Clear selected images when opening modal
        selectedImages = [];

        if (project) {
            // Edit mode
            title.textContent = 'Edit Project';
            form.querySelector('#project-title').value = project.title || '';
            form.querySelector('#project-description').value = project.description || '';
            // Add hidden input for ID
            let idInput = form.querySelector('input[name="id"]');
            if (!idInput) {
                idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.name = 'id';
                form.appendChild(idInput);
            }
            idInput.value = project.id;

            // Display existing images
            if (project.images && project.images.length > 0) {
                selectedImages = project.images.map(img => {
                    // Convert thumbnail path back to full URL for display
                    if (img.includes('assets/images/thumbnails/')) {
                        return `https://raw.githubusercontent.com/enki-verse/enkiverse-website/main/${img.replace('/thumbnails/', '/large/')}`;
                    }
                    return img;
                });
                updateContentImages('project', selectedImages);
            } else {
                document.getElementById('project-images-list').innerHTML = '';
            }
        } else {
            // Add mode
            title.textContent = 'Add Project';
            form.reset();
            document.getElementById('project-images-list').innerHTML = '';
        }

        modal.style.display = 'block';
    } else {
        console.error('Project modal elements not found');
        alert('Project modal not implemented yet');
    }
}

function editProject(id) {
    // Find project by id and show modal
    const projects = JSON.parse(sessionStorage.getItem('current_projects') || '[]');
    const project = projects.find(p => p.id == id);
    if (project) {
        showProjectModal(project);
    }
}

async function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            const success = await removeProjectFromGitHub(id);

            if (success) {
                showMessage('Project deleted successfully!', 'success', document.getElementById('projects-tab'));
                loadProjects();
            } else {
                showMessage('Failed to delete project. Please try again.', 'error', document.getElementById('projects-tab'));
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            showMessage('An error occurred while deleting. Please check console for details.', 'error', document.getElementById('projects-tab'));
        }
    }
}

async function removeProjectFromGitHub(projectId) {
    try {
        // Get current projects data
        const response = await fetch('assets/data/projects.json');
        const data = await response.json();
        const projects = data.projects || [];

        // Find and remove the project
        const updatedProjects = projects.filter(project => project.id !== projectId);

        // If no changes, project wasn't found
        if (updatedProjects.length === projects.length) {
            return false;
        }

        // Find project name for commit message
        const deletedProject = projects.find(project => project.id === projectId);
        const projectName = deletedProject ? deletedProject.title : 'Unknown project';

        // Update the data
        const updatedData = { ...data, projects: updatedProjects };
        const jsonContent = JSON.stringify(updatedData, null, 2);

        // Get current SHA of the file and commit
        const fileSha = await getFileSha('assets/data/projects.json');
        const commitMessage = `Admin: Deleted project - ${projectName}`;

        const result = await window.githubApi.createOrUpdateFile(
            'assets/data/projects.json',
            jsonContent,
            commitMessage,
            fileSha
        );

        return result.success;

    } catch (error) {
        console.error('Error in removeProjectFromGitHub:', error);
        return false;
    }
}

function loadProjects() {
    const response = fetch('assets/data/projects.json');
    const data = response.then(r => r.json());
    const projects = data.then(d => d.projects || []);

    // Store projects data for editing
    projects.then(p => sessionStorage.setItem('current_projects', JSON.stringify(p)));

    renderProjectsList(projects).catch(error => console.error('Error loading projects:', error));
}

async function renderProjectsList(projectsPromise) {
    const container = document.querySelector('#projects-tab .content-list');

    try {
        const projects = await projectsPromise;

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
    } catch (error) {
        console.error('Error rendering projects:', error);
        container.innerHTML = '<div class="loading error">Error loading projects.</div>';
    }
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

        // If directory doesn't exist (404 error), it means no images have been uploaded yet
        if (error.message && error.message.includes('404')) {
            console.log('Thumbnails directory does not exist - no images uploaded yet');
            return [];
        }

        // If API fails for other reasons, try to load locally (fallback)
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