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

    // Particle background
    initParticleBackground();

    // Typewriter effect
    initTypewriterEffect();

    // Parallax effect
    initParallaxEffects();

    // Magnetic button
    initMagneticButton();
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
    // Load artists data for artists page and featured artist on home page
    if (document.querySelector('#artists-list') || document.querySelector('#featured-artist-image')) {
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
            // Also render featured artist on home page
            renderHomeFeaturedArtist(data.artists);
        })
        .catch(error => {
            console.error('Error loading artists data:', error);
        });
}

function renderArtists(artists) {
    console.log('=== renderArtists called with', artists?.length, 'artists ===');
    const featuredArtistElement = document.querySelector('.artist-featured');
    console.log('Featured artist element found:', !!featuredArtistElement);

    if (!featuredArtistElement || !artists || artists.length === 0) {
        console.log('Early return - no element or no artists');
        return;
    }

    // Find the featured artist
    const featuredArtist = artists.find(artist => artist.featured) || artists[0];
    console.log('Featured artist:', featuredArtist.name, 'with', featuredArtist.images?.length, 'images');

    // Update the featured artist
    const imageElement = featuredArtistElement.querySelector('.artist-featured-image img');
    console.log('Image element found:', !!imageElement);

    // Find hero image - handle both old and new formats
    let heroImagePath = null;
    if (featuredArtist.images && featuredArtist.images.length > 0) {
        console.log('Images found in featured artist:', featuredArtist.images);
        // New format with objects
        const heroImageObj = featuredArtist.images.find(img => img.isHero) || featuredArtist.images[0];
        console.log('Hero image object:', heroImageObj);
        heroImagePath = heroImageObj.path || heroImageObj;

        console.log('Initial hero path:', heroImagePath);
        // Convert thumbnail path to full image path for hero display
        if (heroImagePath.includes('/thumbnails/')) {
            heroImagePath = heroImagePath.replace('/thumbnails/', '/large/');
            console.log('Converted to large path:', heroImagePath);
        }
    } else {
        console.log('No images found in featured artist');
    }

    if (imageElement && heroImagePath) {
        // Convert to GitHub URL for public display
        const repoPath = 'enki-verse/enkiverse-website';
        // Decode URL-encoded characters like %20 for spaces
        const decodedPath = decodeURIComponent(heroImagePath);
        const finalImageUrl = `https://raw.githubusercontent.com/${repoPath}/main/${decodedPath}`;
        console.log('Setting image src to:', finalImageUrl);
        console.log('Decoded path:', decodedPath);
        console.log('Full URL:', finalImageUrl);

        imageElement.src = finalImageUrl;
        imageElement.alt = featuredArtist.name || 'Artist';

        // Show image on load
        imageElement.style.display = 'block';

        // Add error handler with fallback strategies
        imageElement.onerror = function() {
            console.log('Image failed to load:', finalImageUrl);
            // Try alternative GitHub URLs
            const fallbackUrls = [
                // Try without main branch
                `https://raw.githubusercontent.com/${repoPath}/master/${decodedPath}`,
                // Try with different usercontent domain (sometimes works better)
                `https://raw.githubusercontentusercontent.com/${repoPath}/main/${decodedPath}`,
                `https://raw.githubusercontentusercontent.com/${repoPath}/master/${decodedPath}`
            ];

            console.log('Trying fallback URLs...');

            let fallbackIndex = 0;
            function tryNextFallback() {
                if (fallbackIndex >= fallbackUrls.length) {
                    // All fallbacks failed, use default
                    console.log('All fallbacks failed, using default');
                    imageElement.src = 'assets/images/small white on black ENKIVERSE logo.png';
                    imageElement.alt = 'Default logo';
                    return;
                }

                const fallbackUrl = fallbackUrls[fallbackIndex++];
                console.log('Trying fallback:', fallbackUrl);

                const testImg = new Image();
                testImg.onload = function() {
                    console.log('Fallback worked:', fallbackUrl);
                    imageElement.src = fallbackUrl;
                };
                testImg.onerror = tryNextFallback;
                testImg.src = fallbackUrl;
            }

            tryNextFallback();
        };

        // Add success handler
        imageElement.onload = function() {
            console.log('Image loaded successfully:', finalImageUrl);
        };

        console.log('Image element src set successfully');
    } else {
        console.log('No image element or hero path, using default');
        if (imageElement) {
            // No images, show default
            imageElement.src = 'assets/images/small white on black ENKIVERSE logo.png';
            imageElement.alt = 'Default logo';
        }
    }

    // Update name and bio
    const nameElement = featuredArtistElement.querySelector('h2');
    if (nameElement) {
        nameElement.textContent = featuredArtist.name || 'Artist';
    }

    const bioElement = featuredArtistElement.querySelector('.artist-bio');
    if (bioElement) {
        bioElement.textContent = featuredArtist.bio || 'Pure expression through visual art and emerging technologies. Pushing the boundaries of digital creativity.';
    }

    // Update website link
    const portfolioLink = featuredArtistElement.querySelector('.btn-secondary');
    if (portfolioLink && featuredArtist.website) {
        portfolioLink.href = featuredArtist.website;
    }

    console.log('=== Featured artist render completed ===');
}

function renderHomeFeaturedArtist(artists) {
    console.log('renderHomeFeaturedArtist called with', artists?.length, 'artists');

    const featuredArtistImage = document.querySelector('#featured-artist-image');
    if (!featuredArtistImage || !artists || artists.length === 0) {
        console.log('No featured artist image element or no artists');
        return;
    }

    // Find the featured artist
    const featuredArtist = artists.find(artist => artist.featured) || artists[0];
    console.log('Setting featured artist image for:', featuredArtist.name);

    // Update image and info
    let heroImagePath = null;
    if (featuredArtist.images && featuredArtist.images.length > 0) {
        const heroImageObj = featuredArtist.images.find(img => img.isHero) || featuredArtist.images[0];
        heroImagePath = heroImageObj.path || heroImageObj;

        if (heroImagePath.includes('/thumbnails/')) {
            heroImagePath = heroImagePath.replace('/thumbnails/', '/large/');
        }
    }

    if (heroImagePath) {
        // Convert to GitHub URL with fallbacks
        const repoPath = 'enki-verse/enkiverse-website';
        const decodedPath = decodeURIComponent(heroImagePath);
        const finalImageUrl = `https://raw.githubusercontent.com/${repoPath}/main/${decodedPath}`;

        console.log('Setting home featured image src to:', finalImageUrl);
        featuredArtistImage.src = finalImageUrl;
        featuredArtistImage.alt = featuredArtist.name || 'Featured Artist';
        featuredArtistImage.style.display = 'block';

        // Add error handling with fallbacks
        featuredArtistImage.onerror = function() {
            console.log('Home featured image failed to load:', finalImageUrl);
            const fallbackUrls = [
                `https://raw.githubusercontent.com/${repoPath}/master/${decodedPath}`,
                `https://raw.githubusercontentusercontent.com/${repoPath}/main/${decodedPath}`,
                `https://raw.githubusercontentusercontent.com/${repoPath}/master/${decodedPath}`
            ];

            let fallbackIndex = 0;
            function tryNextFallback() {
                if (fallbackIndex >= fallbackUrls.length) {
                    featuredArtistImage.src = 'assets/images/small white on black ENKIVERSE logo.png';
                    featuredArtistImage.alt = 'Default logo';
                    return;
                }

                const fallbackUrl = fallbackUrls[fallbackIndex++];
                console.log('Trying home featured fallback:', fallbackUrl);

                const testImg = new Image();
                testImg.onload = function() {
                    featuredArtistImage.src = fallbackUrl;
                };
                testImg.onerror = tryNextFallback;
                testImg.src = fallbackUrl;
            }
            tryNextFallback();
        };

        featuredArtistImage.onload = function() {
            console.log('Home featured image loaded successfully:', finalImageUrl);
        };
    }
}

function renderProjects(projects) {
    const container = document.querySelector('#additional-projects');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = '<p>No additional projects at this time.</p>';
        return;
    }

    let html = '<h3>Additional Projects</h3>';
    projects.slice(1).forEach(project => { // Skip first (featured) project
        // Find hero image
        let heroImagePath = null;
        if (project.images && project.images.length > 0) {
            const heroImageObj = project.images.find(img => img.isHero) || project.images[0];
            heroImagePath = heroImageObj.path || heroImageObj;
        }

        let imageUrl = '';
        if (heroImagePath) {
            if (heroImagePath.includes('/thumbnails/')) {
                heroImagePath = heroImagePath.replace('/thumbnails/', '/large/');
            }
            imageUrl = `https://raw.githubusercontent.com/enki-verse/enkiverse-website/main/${heroImagePath}`;
        } else {
            imageUrl = 'assets/images/small white on black ENKIVERSE logo.png';
        }

        html += `
            <div class="project-item">
                <img src="${imageUrl}" alt="${project.title}" style="width: 200px; height: 150px; object-fit: cover; margin: 10px;">
                <h4>${project.title}</h4>
                <p>${project.description || 'No description available'}</p>
            </div>
        `;
    });

    container.innerHTML = html;
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

// Removed duplicate renderArtists function - the main one above handles all rendering

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
// Canvas particle background
function initParticleBackground() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let mouse = { x: undefined, y: undefined };
    let particlesArray = [];
    let isVisible = true;

    const colors = ['#ffffff'];

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
            this.baseSize = size;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);

            // Create gradient for particle
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, this.color.replace(')', ', 0.5)'));

            ctx.fillStyle = gradient;
            ctx.fill();
        }

        update() {
            // Bounce off edges
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            this.x += this.directionX;
            this.y += this.directionY;

            // Interactive behavior with mouse
            if (mouse.x !== undefined && mouse.y !== undefined) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < canvas.airRadius) {
                    if (distance < canvas.popRadius) {
                        if (this.size >= 0) {
                            this.size -= 0.5;
                        } else {
                            this.size = 0;
                        }
                    } else {
                        if (this.size < this.baseSize) {
                            this.size += 0.1;
                        }
                    }
                } else if (this.size < this.baseSize) {
                    this.size += 0.1;
                }

                if (distance < canvas.airRadius) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }
            }
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = Math.floor((canvas.width * canvas.height) / 12000);

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 5) + 2;
            let x = (Math.random() * (canvas.width - size * 2)) + size;
            let y = (Math.random() * (canvas.height - size * 2)) + size;
            let directionX = (Math.random() * 2) - 1;
            let directionY = (Math.random() * 2) - 1;
            let color = colors[Math.floor(Math.random() * colors.length)];

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function animate() {
        if (isVisible) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }

            // Collision detection and merging
            for (let i = 0; i < particlesArray.length; i++) {
                for (let j = i + 1; j < particlesArray.length; j++) {
                    let dx = particlesArray[i].x - particlesArray[j].x;
                    let dy = particlesArray[i].y - particlesArray[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let minDistance = particlesArray[i].size + particlesArray[j].size;

                    if (distance < minDistance) {
                        // merge smaller into larger
                        let larger = particlesArray[i].size >= particlesArray[j].size ? i : j;
                        let smaller = particlesArray[i].size >= particlesArray[j].size ? j : i;

                        // Add sizes to make noticeably bigger
                        particlesArray[larger].size += particlesArray[j].size;
                        particlesArray[larger].size = Math.min(particlesArray[larger].size, 100); // cap size higher
                        particlesArray.splice(smaller, 1);
                        j--; // adjust loop
                    }
                }
            }

            // Draw all particles with difference blend mode for visibility
            ctx.globalCompositeOperation = 'difference';
            particlesArray.forEach(particle => particle.draw());

            animationId = requestAnimationFrame(animate);
        } else {
            animationId = null;
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.airRadius = canvas.width / 90;
        canvas.popRadius = canvas.width / 25;
        cancelAnimationFrame(animationId);
        init();
    }

    // Mouse event handlers
    function trackMousePosition(e) {
        mouse.x = e.x;
        mouse.y = e.y;
    }

    function resetMouse() {
        mouse.x = undefined;
        mouse.y = undefined;
    }

    resizeCanvas();
    animate();

    // Event listeners
    window.addEventListener('mousemove', trackMousePosition);
    window.addEventListener('mouseout', resetMouse);
    window.addEventListener('resize', resizeCanvas);

    // Handle visibility change to pause/resume animation
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible && !animationId) {
            animate();
        }
    });

    // Store animation ID for cleanup if needed
    canvas.animationId = animationId;
}
// Typewriter effect for main heading
function initTypewriterEffect() {
    const heading = document.querySelector('.hero h1');
    if (!heading) return;

    const text = heading.textContent;
    heading.textContent = '';
    heading.style.borderRight = '2px solid #00f5ff';
    heading.style.whiteSpace = 'nowrap';

    let i = 0;
    const typingSpeed = 100; // milliseconds
    const cursorBlinkSpeed = 500;

    let cursorVisible = true;
    let cursorInterval;

    function blinkCursor() {
        cursorVisible = !cursorVisible;
        heading.style.borderColor = cursorVisible ? '#00f5ff' : 'transparent';
    }

    function typeWriter() {
        if (i < text.length) {
            heading.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, typingSpeed);
        } else {
            // Typing complete, start blinking cursor
            cursorInterval = setInterval(blinkCursor, cursorBlinkSpeed);

            // Stop blinking after a few seconds
            setTimeout(() => {
                clearInterval(cursorInterval);
                heading.style.borderColor = 'transparent';
            }, 3000);
        }
    }

    // Start typing after a brief delay
    setTimeout(typeWriter, 1000);
}
// Parallax scrolling effects for hero
function initParallaxEffects() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const canvas = document.getElementById('hero-canvas');
    const heroLogo = document.querySelector('.hero-logo');

    if (!hero || !heroContent) return;

    let ticking = false;

    function updateParallax(scrollY) {
        const parallaxFactor = 0.5;
        const scaleFactor = 1 - scrollY * 0.001;

        // Parallax transform for content
        const translateY = scrollY * parallaxFactor;

        heroContent.style.transform = `translateY(${translateY}px) scale(${Math.max(scaleFactor, 0.8)})`;

        // If canvas exists, also parallax it slightly less
        if (canvas) {
            canvas.style.transform = `translateY(${scrollY * 0.2}px)`;
        }

        // Parallax for logo with opposite direction for floating effect
        if (heroLogo) {
            heroLogo.style.transform += ` translateY(${-scrollY * 0.1}px)`;
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax(window.scrollY);
                ticking = true;
            });
        }
        ticking = true;
    }

    // Throttle scroll events
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial call
    updateParallax(0);
}
// Magnetic hover effect for CTA button
function initMagneticButton() {
    const button = document.querySelector('.cta-button');
    if (!button) return;

    const magneticStrength = 0.3;
    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;

    function updateButtonPosition() {
        if (!isHovered) return;

        const rect = button.getBoundingClientRect();
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;

        const deltaX = mouseX - buttonCenterX;
        const deltaY = mouseY - buttonCenterY;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 100; // pixels

        let attractX = 0;
        let attractY = 0;

        if (distance < maxDistance) {
            const strength = (maxDistance - distance) / maxDistance * magneticStrength;
            attractX = deltaX * strength;
            attractY = deltaY * strength;
        }

        button.style.transform = `translate(${attractX}px, ${attractY}px)`;
    }

    function mouseEnter() {
        isHovered = true;
    }

    function mouseLeave() {
        isHovered = false;
        button.style.transform = 'translate(0px, 0px)';
    }

    function mouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        updateButtonPosition();
    }

    button.addEventListener('mouseenter', mouseEnter);
    button.addEventListener('mouseleave', mouseLeave);
    document.addEventListener('mousemove', mouseMove);
}