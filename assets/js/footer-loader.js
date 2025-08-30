document.addEventListener('DOMContentLoaded', function() {
    fetch('footer.html')
        .then(response => response.text())
        .then(html => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;

                // Get page
                const page = document.body.dataset.page;

                let configs = {
                    home: {
                        connectTitle: 'Connect',
                        connect: [
                            ['about.html', 'About Us'],
                            ['artists.html', 'Artists'],
                            ['projects.html', 'Projects'],
                            ['events.html', 'Events']
                        ],
                        secondTitle: 'Community',
                        secondLinks: [
                            ['community.html', 'Vision & Land Project'],
                            ['contact.html', 'Contact'],
                            ['https://github.com/enki-verse/enkiverse-website', 'GitHub']
                        ],
                        thirdTitle: '',
                        thirdLinks: []
                    },
                    about: {
                        connectTitle: 'Connect',
                        connect: [
                            ['/', 'Home'],
                            ['artists.html', 'Artists'],
                            ['projects.html', 'Projects'],
                            ['contact.html', 'Contact']
                        ],
                        secondTitle: 'Community',
                        secondLinks: [
                            ['/', 'Home'],
                            ['about.html', 'About Us'],
                            ['artists.html', 'Artists'],
                            ['contact.html', 'Contact']
                        ],
                        thirdTitle: '',
                        thirdLinks: []
                    },
                    artists: {
                        connectTitle: 'Connect',
                        connect: [
                            ['/', 'Home'],
                            ['artists.html', 'Artists'],
                            ['projects.html', 'Projects'],
                            ['contact.html', 'Contact']
                        ],
                        secondTitle: 'Community',
                        secondLinks: [
                            ['events.html', 'Events'],
                            ['community.html', 'Community'],
                            ['https://github.com/enki-verse/enkiverse-website', 'GitHub']
                        ],
                        thirdTitle: '',
                        thirdLinks: []
                    },
                    projects: {
                        connectTitle: 'Connect',
                        connect: [
                            ['/', 'Home'],
                            ['artists.html', 'Artists'],
                            ['projects.html', 'Projects'],
                            ['contact.html', 'Contact']
                        ],
                        secondTitle: 'Community',
                        secondLinks: [
                            ['events.html', 'Events'],
                            ['community.html', 'Community'],
                            ['https://github.com/enki-verse/enkiverse-website', 'GitHub']
                        ],
                        thirdTitle: '',
                        thirdLinks: []
                    },
                    events: {
                        connectTitle: 'Connect',
                        connect: [
                            ['/', 'Home'],
                            ['contact.html', 'Contact'],
                            ['about.html', 'About Us']
                        ],
                        secondTitle: 'Community',
                        secondLinks: [
                            ['community.html', 'Vision & Land Project']
                        ],
                        thirdTitle: '',
                        thirdLinks: []
                    },
                    community: {
                        connectTitle: 'Connect',
                        connect: [
                            ['/', 'Home'],
                            ['contact.html', 'Contact'],
                            ['events.html', 'Events']
                        ],
                        secondTitle: 'Community',
                        secondLinks: [
                            ['community.html', 'Vision & Land Project']
                        ],
                        thirdTitle: 'Projects',
                        thirdLinks: [
                            ['projects.html', 'Current Initiatives']
                        ]
                    },
                    contact: {
                        connectTitle: 'Connect',
                        connect: [
                            ['/', 'Home'],
                            ['about.html', 'About Us'],
                            ['community.html', 'Community']
                        ],
                        secondTitle: 'Follow',
                        secondLinks: [
                            ['https://github.com/enki-verse/enkiverse-website', 'GitHub']
                        ],
                        thirdTitle: '',
                        thirdLinks: []
                    }
                };

                const config = configs[page];

                if (config) {
                    // Populate connect links
                    const connectUl = document.getElementById('connect-links');
                    if (connectUl) {
                        connectUl.innerHTML = config.connect.map(([href, text]) =>
                            `<li><a href="${href}">${text}</a></li>`
                        ).join('');
                    }

                    // Second section
                    if (config.secondTitle) {
                        const secondH4 = document.getElementById('second-title');
                        if (secondH4) secondH4.textContent = config.secondTitle;

                        const secondUl = document.getElementById('second-links');
                        if (secondUl) {
                            secondUl.innerHTML = config.secondLinks.map(([href, text]) =>
                                `<li><a href="${href}"${href.startsWith('http') ? ' target="_blank"' : ''}>${text}</a></li>`
                            ).join('');
                        }
                    }

                    // Third section
                    if (config.thirdTitle) {
                        const thirdH4 = document.getElementById('third-title');
                        if (thirdH4) thirdH4.textContent = config.thirdTitle;

                        const thirdUl = document.getElementById('third-links');
                        if (thirdUl) {
                            thirdUl.innerHTML = config.thirdLinks.map(([href, text]) =>
                                `<li><a href="${href}">${text}</a></li>`
                            ).join('');
                        }
                    } else {
                        // Hide third section if empty
                        const thirdSection = document.getElementById('third-section');
                        if (thirdSection) thirdSection.style.display = 'none';
                    }
                }
            }
        })
        .catch(error => console.error('Failed to load footer:', error));
});