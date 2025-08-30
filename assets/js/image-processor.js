// ENKIVERSE Foundation - Image Processing JavaScript

// Global variables
let fabricCanvas = null;

// Initialize Fabric.js canvas
function initializeCanvas() {
    if (typeof fabric !== 'undefined') {
        fabricCanvas = new fabric.Canvas('image-canvas', {
            selection: true,
            controlsAboveOverlay: true
        });
    }
}

// Image processing functions
async function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                try {
                    // Create canvas for processing
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Resize image (max 800px width, maintain aspect ratio)
                    const maxWidth = 800;
                    const aspectRatio = img.width / img.height;
                    let newWidth = maxWidth;
                    let newHeight = maxWidth / aspectRatio;

                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    // Draw resized image
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);

                    // Compress and convert to blob
                    canvas.toBlob(function(blob) {
                        if (blob) {
                            resolve({
                                success: true,
                                originalFile: file,
                                processedBlob: blob,
                                width: newWidth,
                                height: newHeight,
                                url: URL.createObjectURL(blob)
                            });
                        } else {
                            resolve({
                                success: false,
                                error: 'Failed to create blob from canvas'
                            });
                        }
                    }, 'image/jpeg', 0.8); // 80% quality
                } catch (canvasError) {
                    console.error('Canvas processing error:', canvasError);
                    resolve({
                        success: false,
                        error: `Canvas processing failed: ${canvasError.message}`
                    });
                }
            };

            img.onerror = function() {
                resolve({
                    success: false,
                    error: 'Failed to load image for processing'
                });
            };

            img.src = event.target.result;
        };

        reader.onerror = function() {
            resolve({
                success: false,
                error: 'Error reading image file'
            });
        };

        reader.readAsDataURL(file);
    });
}

async function generateThumbnail(imgSrc, maxWidth = 200, maxHeight = 200) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = function() {
            try {
                // Calculate thumbnail dimensions
                let { width, height } = calculateDimensions(
                    img.width,
                    img.height,
                    maxWidth,
                    maxHeight
                );

                canvas.width = width;
                canvas.height = height;

                // Draw thumbnail
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob(function(blob) {
                    if (blob) {
                        const thumbnailUrl = URL.createObjectURL(blob);
                        resolve({
                            success: true,
                            blob: blob,
                            url: thumbnailUrl,
                            width: width,
                            height: height
                        });
                    } else {
                        resolve({
                            success: false,
                            error: 'Failed to create thumbnail blob'
                        });
                    }
                }, 'image/jpeg', 0.7); // 70% quality for thumbnails
            } catch (canvasError) {
                console.error('Thumbnail canvas processing error:', canvasError);
                resolve({
                    success: false,
                    error: `Thumbnail processing failed: ${canvasError.message}`
                });
            }
        };

        img.onerror = function() {
            resolve({
                success: false,
                error: 'Failed to load image for thumbnail generation'
            });
        };

        // If imgSrc is already an object URL or blob URL
        if (imgSrc instanceof Blob) {
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(imgSrc);
        } else {
            img.src = imgSrc;
        }
    });
}

function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    const aspectRatio = originalWidth / originalHeight;

    let width = Math.min(originalWidth, maxWidth);
    let height = width / aspectRatio;

    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
}

async function uploadImage(file, progressCallback = null) {
    try {
        // Process image
        const processedImage = await processImage(file);

        // Generate thumbnail
        const thumbnail = await generateThumbnail(processedImage.url);

        return {
            success: true,
            processedImage: processedImage,
            thumbnail: thumbnail,
            originalFile: file
        };

    } catch (error) {
        console.error('Image processing error:', error);
        return {
            success: false,
            error: error.message || 'Failed to process image'
        };
    }
}

function saveImageToServer(imageData, filename, path = 'assets/images/') {
    // This would normally upload to server/storage
    // For now, we'll just return a promise that resolves
    return new Promise((resolve, reject) => {
        // Simulate server upload delay
        setTimeout(() => {
            const imagePath = `${path}large/${filename}`;
            const thumbnailPath = `${path}thumbnails/${filename}`;

            resolve({
                success: true,
                imagePath: imagePath,
                thumbnailPath: thumbnailPath
            });
        }, 1000);
    });
}

// Batch image processing
async function processBatchImages(files, onProgress = null) {
    const results = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
        try {
            const result = await processImage(files[i]);
            results.push(result);

            if (onProgress) {
                onProgress((i + 1) / total * 100);
            }
        } catch (error) {
            console.error(`Error processing ${files[i].name}:`, error);
            results.push({
                success: false,
                file: files[i],
                error: error.message
            });
        }
    }

    return results;
}

// Image validation
function validateImage(file) {
    const errors = [];

    // File size check (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        errors.push('File size must be less than 5MB');
    }

    // File type check
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        errors.push('File must be a valid image type (JPEG, PNG, GIF, WebP)');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function(e) {
            img.onload = function() {
                resolve({
                    width: img.width,
                    height: img.height
                });
            };
            img.onerror = function() {
                reject('Failed to load image for dimension detection');
            };
            img.src = e.target.result;
        };

        reader.onerror = function() {
            reject('Failed to read file for dimension detection');
        };

        reader.readAsDataURL(file);
    });
}

// Expose functions globally for admin.js usage
window.imageProcessor = {
    processImage,
    generateThumbnail,
    validateImage,
    uploadImage,
    formatFileSize
};

// Initialize on page load if needed
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we have image processing elements on the page
    const imageUpload = document.getElementById('image-upload');
    if (imageUpload) {
        // Initialize canvas if canvas element exists (for admin panel)
        const canvas = document.getElementById('image-canvas');
        if (canvas) {
            initializeCanvas();
        }
    }
});