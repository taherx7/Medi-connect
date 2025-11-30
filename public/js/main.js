document.addEventListener('DOMContentLoaded', () => {
    // --- Dark Mode Logic ---
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');

    // Check saved preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // --- Mobile Menu Logic ---
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const closeBtn = document.getElementById('closeMenuBtn');

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (mobileBtn) {
        mobileBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        closeBtn.addEventListener('click', toggleMenu);
    }

    // --- Stat Counter Animation ---
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = formatNumber(target);
                clearInterval(timer);
            } else {
                element.textContent = formatNumber(Math.floor(current));
            }
        }, 16);
    }
    
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + ',000+';
        }
        return num + '+';
    }
    
    // --- About Section Animation ---
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(entry.target.dataset.animate);
                aboutObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    // Observe about sections
    document.querySelectorAll('.about-text, .about-image').forEach(el => {
        aboutObserver.observe(el);
    });

    // --- Stats Counter Observer ---
    let statsAnimated = false;
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                
                // Get all stat numbers
                const statNumbers = document.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    const numMatch = text.match(/[\d,]+/);
                    if (numMatch) {
                        const target = parseInt(numMatch[0].replace(/,/g, ''));
                        animateCounter(stat, target);
                    }
                });
                
                statsObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // --- Scroll Reveal Animation ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observe elements
    const revealElements = document.querySelectorAll('.card, .step-card');
    revealElements.forEach(el => observer.observe(el));

    // --- Search Autocomplete with Custom Dropdown ---
    const searchInput = document.getElementById('doctor-search-input');
    const dropdown = document.getElementById('search-results-dropdown');
    
    if (searchInput && dropdown) {
        let timeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }
            
            timeout = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/doctors/search?q=${encodeURIComponent(query)}`);
                    const doctors = await response.json();
                    
                    if (doctors.length === 0) {
                        dropdown.innerHTML = '<div class="search-dropdown-empty">No doctors found</div>';
                        dropdown.style.display = 'block';
                        return;
                    }
                    
                    dropdown.innerHTML = doctors.map(doc => `
                        <a href="/patient/doctor/${doc.id}" class="search-dropdown-item">
                            <div class="search-dropdown-avatar">
                                ${doc.photos_url 
                                    ? `<img src="${doc.photos_url}" alt="${doc.name}">` 
                                    : doc.name.charAt(0)
                                }
                            </div>
                            <div class="search-dropdown-info">
                                <div class="search-dropdown-name">${doc.name}</div>
                                <div class="search-dropdown-location">
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${doc.location || 'Location not specified'}
                                </div>
                            </div>
                        </a>
                    `).join('');
                    
                    dropdown.style.display = 'block';
                } catch (err) {
                    console.error('Search error:', err);
                }
            }, 300);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
        
        // Keep dropdown open when clicking inside it
        dropdown.addEventListener('click', (e) => {
            // Links will navigate, so this is just for safety
            e.stopPropagation();
        });
    }

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
});
