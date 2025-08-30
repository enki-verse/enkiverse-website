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
            }
        })
        .catch(error => console.error('Failed to load navigation:', error));
});