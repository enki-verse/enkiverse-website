document.addEventListener('DOMContentLoaded', function() {
    fetch('nav.html')
        .then(response => response.text())
        .then(html => {
            const placeholder = document.getElementById('nav-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;

                // Highlight current page
                const navLinks = document.querySelectorAll('.nav-menu a');
                const currentPath = window.location.pathname.replace(/^\//, ''); // remove leading /

                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === currentPath || (currentPath === '' && href === '/')) {
                        link.classList.add('active');
                    }
                });

                // Also check admin link
                const adminLink = document.getElementById('admin-link');
                if (adminLink && adminLink.getAttribute('href') === currentPath) {
                    adminLink.classList.add('active');
                }

                // Hamburger menu toggle
                const navToggle = document.getElementById('nav-toggle');
                const navMenu = document.querySelector('.nav-menu');

                if (navToggle && navMenu) {
                    navToggle.addEventListener('click', function() {
                        navMenu.classList.toggle('active');
                        navToggle.classList.toggle('active');
                    });
                }

                // Dropdown toggle for Projects
                const dropdownToggle = document.querySelector('.dropdown a');
                const dropdownMenu = document.querySelector('.dropdown-menu');
                const dropdownLi = document.querySelector('.dropdown');

                if (dropdownToggle && dropdownMenu) {
                    // For mobile: click to toggle
                    dropdownToggle.addEventListener('click', function(e) {
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            dropdownLi.classList.toggle('open');
                            const expanded = dropdownLi.classList.contains('open');
                            dropdownToggle.setAttribute('aria-expanded', expanded);
                        }
                    });

                    // For desktop: hover to show
                    dropdownLi.addEventListener('mouseenter', function() {
                        if (window.innerWidth > 768) {
                            dropdownLi.classList.add('open');
                        }
                    });
                    dropdownLi.addEventListener('mouseleave', function() {
                        if (window.innerWidth > 768) {
                            dropdownLi.classList.remove('open');
                        }
                    });
                }

                // Close menu on link click (mobile)
                navLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        if (window.innerWidth <= 768) {
                            navMenu.classList.remove('active');
                            navToggle.classList.remove('active');
                        }
                        if (dropdownLi) {
                            dropdownLi.classList.remove('open');
                        }
                    });
                });

                // Close on outside click (mobile)
                document.addEventListener('click', function(e) {
                    if (window.innerWidth <= 768 && !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                        if (dropdownLi) {
                            dropdownLi.classList.remove('open');
                        }
                    }
                });
            }
        })
        .catch(error => console.error('Failed to load navigation:', error));
});