/* ==========================================================================
   AVIZ STUDIO PORTFOLIO SYSTEM - DESIGN 3 JAVASCRIPT
   ========================================================================== */

// --- ANTI-FLASH THEME & LOADER SESSION INITIALIZER ---
// Self-executing wrapper to load user theme and preloader settings immediately
(function() {
    try {
        // Default theme to light
        var theme = 'light';
        // Track if theme has been recovered from storage/cookies
        var hasStorage = false;
        
        try {
            // Retrieve theme preference from localStorage
            theme = localStorage.getItem('theme');
            // If theme is valid, set storage flag to true
            if (theme === 'dark' || theme === 'light') {
                hasStorage = true;
            }
        } catch(e) {}
        
        // If not found in localStorage, search in sessionStorage
        if (!hasStorage) {
            try {
                // Retrieve theme preference from sessionStorage
                theme = sessionStorage.getItem('theme');
                // If theme is valid, set storage flag to true
                if (theme === 'dark' || theme === 'light') {
                    hasStorage = true;
                }
            } catch(e) {}
        }
        
        // If not found in sessionStorage, search in document cookies
        if (!hasStorage) {
            try {
                // Split cookies string by semicolons to check individual cookie entries
                var cookies = document.cookie.split(';');
                // Loop through all parsed cookie items
                for (var i = 0; i < cookies.length; i++) {
                    // Split the key and value pair by the equals sign
                    var parts = cookies[i].split('=');
                    // Check if the cookie key matches 'theme' after trimming whitespace
                    if (parts[0].trim() === 'theme') {
                        // Extract and trim the theme value
                        theme = parts[1].trim();
                        // Mark storage flag as true
                        hasStorage = true;
                        // Exit loop once found
                        break;
                    }
                }
            } catch(e) {}
        }
        
        // If still not found, check for query parameters or hashes in active URL
        if (!hasStorage) {
            try {
                // Get the current window location string
                var url = window.location.href;
                // If URL contains 'theme=dark' parameter or '#dark' hash
                if (url.indexOf('theme=dark') !== -1 || url.indexOf('#dark') !== -1) {
                    // Set active theme to dark
                    theme = 'dark';
                // Else if URL contains 'theme=light' parameter or '#light' hash
                } else if (url.indexOf('theme=light') !== -1 || url.indexOf('#light') !== -1) {
                    // Set active theme to light
                    theme = 'light';
                } else {
                    // Default fallback to light
                    theme = 'light';
                }
            } catch(e) {}
        }

        // If the recovered theme preference is dark
        if (theme === 'dark') {
            // Add 'dark-theme' class to the HTML document element immediately
            document.documentElement.classList.add('dark-theme');
        }
        
        // Track loader session state
        var loaded = false;
        try {
            // Retrieve loaded state from sessionStorage
            loaded = !!sessionStorage.getItem('loaded');
        } catch(e) {}
        // If the loader has already completed in this session
        if (loaded) {
            // Add class to skip loader animations on subsequent page visits
            document.documentElement.classList.add('loader-skipped');
        }
    } catch (e) {
        // Fail silently in strict privacy/incognito modes
    }
})();

// Wait for full page DOMContentLoaded before initializing main JS features
document.addEventListener('DOMContentLoaded', () => {
    // --- Safe Storage Helpers for compatibility with Incognito/Private tabs ---
    const safeSessionStorage = {
        // Safely fetch items from sessionStorage
        getItem: (key) => {
            try {
                // Return value from sessionStorage
                return sessionStorage.getItem(key);
            } catch (e) {
                // Return null if blocked by privacy settings
                return null;
            }
        },
        // Safely write items to sessionStorage
        setItem: (key, val) => {
            try {
                // Set value in sessionStorage
                sessionStorage.setItem(key, val);
            } catch (e) {
                // Fail silently if blocked
            }
        }
    };

    const safeLocalStorage = {
        // Safely fetch items from localStorage
        getItem: (key) => {
            try {
                // Return value from localStorage
                return localStorage.getItem(key);
            } catch (e) {
                // Return null if blocked by privacy settings
                return null;
            }
        },
        // Safely write items to localStorage
        setItem: (key, val) => {
            try {
                // Set value in localStorage
                localStorage.setItem(key, val);
            } catch (e) {
                // Fail silently if blocked
            }
        }
    };

    // --- 1. PREMIUM PAGE LOADER TRANSITION (SESSION-BASED) & HASH SMOOTH SCROLLER ---
    // Fetch preloader page element reference
    const loader = document.getElementById('loader');
    // Fetch body container reference
    const body = document.body;

    // Set scroll restoration to manual to prevent browser default hash jump
    try {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    } catch (e) {}

    // Smoothly scroll to hash element if exists in URL on load
    const handleHashScroll = (delay) => {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                // Ensure page starts at top before smooth scroll starts
                window.scrollTo({ top: 0 });
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, delay);
            }
        }
    };

    // Transition loader opacity to zero and reveal page
    const dismissLoader = () => {
        // Verify loader exists
        if (loader) {
            // Set opacity to transparent for fading effect
            loader.style.opacity = '0';
            // Hide container from pointer clicks
            loader.style.visibility = 'hidden';
        }
        // Remove class indicating loading state is active
        body.classList.remove('loading-active');
        // Trigger initial fade-in animations of hero elements
        triggerHeroReveals();
        // Trigger smooth scroll to target hash (wait for loader fade animation: 500ms)
        handleHashScroll(500);
    };

    // Session-based loading: skip loading screen if already visited in this session
    if (safeSessionStorage.getItem('loaded') || document.documentElement.classList.contains('loader-skipped')) {
        // Verify loader exists
        if (loader) {
            // Instantly hide loader block without animations
            loader.style.display = 'none';
        }
        // Remove class indicating loading state is active
        body.classList.remove('loading-active');
        // Activate all entrance reveals immediately for instant navigation
        const allReveals = document.querySelectorAll('.reveal, .reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale-in, .reveal-mask-up, .reveal-img-wipe');
        // Loop through all elements and add active status
        allReveals.forEach(el => el.classList.add('active'));
        // Trigger smooth scroll to target hash immediately with small delay (500ms)
        handleHashScroll(500);
    } else {
        // Otherwise wait 3.5 seconds, then dismiss loader screen
        setTimeout(() => {
            // Run dismissal animation
            dismissLoader();
            // Store load status in session storage
            safeSessionStorage.setItem('loaded', 'true');
        }, 3500);
    }

    // Instantly reveal all elements in the hero banner
    function triggerHeroReveals() {
        // Query all reveal elements inside home section
        const heroReveals = document.querySelectorAll('#home .reveal-mask-up');
        // Loop through elements and add active reveal class
        heroReveals.forEach(el => {
            // Apply active class to trigger CSS transition
            el.classList.add('active');
        });
    }

    // --- 2. FLOATING NAVBAR SCROLL EFFECTS ---
    // Get reference to navbar container
    const navbar = document.getElementById('navbar');
    // Verify navbar exists on current page
    if (navbar) {
        // Add scroll listener to update styling dynamically
        window.addEventListener('scroll', () => {
            // Check if page scroll offset has crossed 50px
            if (window.scrollY > 50) {
                // Apply class to reduce navbar height and add backdrop blur
                navbar.classList.add('nav-scrolled');
            } else {
                // Remove scrolled class when back to top
                navbar.classList.remove('nav-scrolled');
            }
        });
    }

    // --- 3. RESPONSIVE MOBILE MENU SYSTEM ---
    // Get mobile menu toggle hamburger button
    const hamburgerToggle = document.getElementById('hamburger-toggle');
    // Get navigation drawer links container
    const navMenu = document.getElementById('nav-menu');
    // Query all anchors inside mobile navigation menu
    const navLinks = document.querySelectorAll('.nav-links a');

    // Verify elements exist before adding listeners
    if (hamburgerToggle && navMenu) {
        // Open/Close menu drawer on hamburger button click
        hamburgerToggle.addEventListener('click', (e) => {
            // Prevent event bubbling to document level
            e.stopPropagation();
            // Toggle hamburger button active state (converts to X)
            hamburgerToggle.classList.toggle('active');
            // Toggle visibility active state of navigation drawer
            navMenu.classList.toggle('active');
        });

        // Close menu drawer with a slight delay when a link is clicked
        navLinks.forEach(link => {
            // Add click listener to each menu link
            link.addEventListener('click', () => {
                // Delay menu slide-back for better UX response
                setTimeout(() => {
                    // Close hamburger icon state
                    hamburgerToggle.classList.remove('active');
                    // Close navigation drawer state
                    navMenu.classList.remove('active');
                }, 300); // 300ms delay to let tap click register and page react first
            });
        });

        // Close menu if user clicks/taps outside the menu drawer
        document.addEventListener('click', (e) => {
            // Check if mobile menu is currently open
            if (navMenu.classList.contains('active')) {
                // If click was outside both hamburger button and drawer
                if (!navMenu.contains(e.target) && !hamburgerToggle.contains(e.target)) {
                    // Deactivate hamburger active state
                    hamburgerToggle.classList.remove('active');
                    // Deactivate menu drawer active state
                    navMenu.classList.remove('active');
                }
            }
        });
    }

    // --- 4. INTERSECTION OBSERVER SCROLL REVEALS ---
    // Query all scroll reveal elements on the page
    const revealElements = document.querySelectorAll('.reveal, .reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale-in, .reveal-mask-up, .reveal-img-wipe');
    // Configure observer to reveal elements dynamically on scroll entry
    const revealObserver = new IntersectionObserver((entries, observer) => {
        // Loop through all intersection observer records
        entries.forEach(entry => {
            // If the element enters the trigger boundary
            if (entry.isIntersecting) {
                // Skip animations for home elements since they are handled separately on load
                if (entry.target.closest('#home')) {
                    // Stop observing the target element
                    observer.unobserve(entry.target);
                    // Exit callback
                    return;
                }
                // Add active class to start reveal transition
                entry.target.classList.add('active');
                // Stop observing element once animated into view
                observer.unobserve(entry.target);
            }
        });
    }, {
        // Trigger threshold: 10% element entry
        threshold: 0.1,
        // Root margin: trigger 50px before entering viewport
        rootMargin: '0px 0px -50px 0px'
    });

    // Start tracking every reveal element using the observer
    revealElements.forEach(el => {
        // Bind element to observer
        revealObserver.observe(el);
    });

    // --- 5. THEME TOGGLER (PERSISTENT & FLASH-FREE) ---
    // Get desktop theme switcher button
    const themeToggleBtn = document.getElementById('theme-toggle');
    // Get mobile theme switcher button inside drawer menu
    const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');

    // Toggle display icons inside theme buttons dynamically
    const updateToggleIcons = (theme) => {
        // Query all moon icon SVG tags
        const moonIcons = document.querySelectorAll('.moon-icon');
        // Query all sun icon SVG tags
        const sunIcons = document.querySelectorAll('.sun-icon');

        // If theme is dark, show sun and hide moon
        if (theme === 'dark') {
            // Hide moon icon
            moonIcons.forEach(icon => icon.style.display = 'none');
            // Show sun icon
            sunIcons.forEach(icon => icon.style.display = 'block');
        } else {
            // Show moon icon
            moonIcons.forEach(icon => icon.style.display = 'block');
            // Hide sun icon
            sunIcons.forEach(icon => icon.style.display = 'none');
        }
    };

    // Apply dark or light theme rules to DOM, storage, and cookies
    const applyTheme = (theme) => {
        // If requested theme is dark
        if (theme === 'dark') {
            // Add class to HTML root
            document.documentElement.classList.add('dark-theme');
            // Add class to body container
            document.body.classList.add('dark-theme');
            // Set localStorage value
            safeLocalStorage.setItem('theme', 'dark');
            // Set sessionStorage value
            safeSessionStorage.setItem('theme', 'dark');
            try {
                // Set cookie value path-wide for 365 days
                document.cookie = "theme=dark; path=/; max-age=" + (365*24*60*60);
            } catch (e) {}
        } else {
            // Remove class from HTML root
            document.documentElement.classList.remove('dark-theme');
            // Remove class from body container
            document.body.classList.remove('dark-theme');
            // Set localStorage value
            safeLocalStorage.setItem('theme', 'light');
            // Set sessionStorage value
            safeSessionStorage.setItem('theme', 'light');
            try {
                // Set cookie value path-wide for 365 days
                document.cookie = "theme=light; path=/; max-age=" + (365*24*60*60);
            } catch (e) {}
        }
        // Update display icons inside buttons
        updateToggleIcons(theme);

    };

    // Check saved storage preference on load, default to light
    const getSavedThemeOnLoad = () => {
        // Fetch theme from localStorage
        let theme = safeLocalStorage.getItem('theme');
        // Return if found in localStorage
        if (theme) return theme;
        // Otherwise fetch theme from sessionStorage
        theme = safeSessionStorage.getItem('theme');
        // Return if found in sessionStorage
        if (theme) return theme;
        try {
            // Otherwise search theme key in document cookies
            const cookies = document.cookie.split(';');
            // Loop through cookie items
            for (let i = 0; i < cookies.length; i++) {
                // Split key/value pair
                const parts = cookies[i].split('=');
                // Check if trimmed key matches theme
                if (parts[0].trim() === 'theme') {
                    // Return cookie value
                    return parts[1].trim();
                }
            }
        } catch (e) {}

        // Fallback to URL parameters (useful under sandboxed protocols like file://)
        try {
            // Get current page URL
            const url = window.location.href;
            // If URL contains theme=dark search query or hash
            if (url.indexOf('theme=dark') !== -1 || url.indexOf('#dark') !== -1) return 'dark';
            // If URL contains theme=light search query or hash
            if (url.indexOf('theme=light') !== -1 || url.indexOf('#light') !== -1) return 'light';
        } catch (e) {}

        // Default fallback theme
        return 'light';
    };
    // Fetch correct startup theme
    const savedTheme = getSavedThemeOnLoad();
    // Apply startup theme state
    applyTheme(savedTheme);

    // Event handler for theme button toggle click event
    const toggleThemeAction = (e) => {
        // If event is defined
        if (e) {
            // Prevent default button behavior
            e.preventDefault();
            // Block event bubbling to document level
            e.stopPropagation();
        }
        
        // Add temporary transition helper class for fluid layout color swaps
        document.documentElement.classList.add('theme-transitioning');
        // Verify current layout theme state
        const isDark = document.documentElement.classList.contains('dark-theme');
        // Apply target opposite theme
        applyTheme(isDark ? 'light' : 'dark');

        // Remove temporary transition class after animation completes (800ms)
        setTimeout(() => {
            // Remove class from HTML element
            document.documentElement.classList.remove('theme-transitioning');
        }, 800);

        // Close mobile drawer menu when theme is toggled
        const hamburgerToggle = document.getElementById('hamburger-toggle');
        const navMenu = document.getElementById('nav-menu');
        // If elements exist and mobile menu is open
        if (hamburgerToggle && navMenu && navMenu.classList.contains('active')) {
            // Wait 400ms for theme change to render, then close menu drawer
            setTimeout(() => {
                // Reset hamburger icon active status
                hamburgerToggle.classList.remove('active');
                // Hide menu drawer
                navMenu.classList.remove('active');
            }, 400); // 400ms delay to let the theme switch transition render first
        }
    };

    // Bind theme button click listeners if they exist on the page
    if (themeToggleBtn) {
        // Bind desktop button click listener
        themeToggleBtn.addEventListener('click', toggleThemeAction);
    }
    if (themeToggleMobileBtn) {
        // Bind mobile menu button click listener
        themeToggleMobileBtn.addEventListener('click', toggleThemeAction);
    }

    // Handle back/forward cache theme restoration
    window.addEventListener('pageshow', (event) => {
        // Fetch active theme preference on page display
        const savedTheme = getSavedThemeOnLoad();
        // Force sync application of recovered theme
        applyTheme(savedTheme);
    });

    // --- 6. AUTO-SLIDING CAROUSELS WITH SEAMLESS INFINITE LOOP ---
    // Query all project slider blocks
    const carousels = document.querySelectorAll('.project-block');
    // Bind slider interactions to each block
    carousels.forEach(block => {
        // Get horizontal sliding viewport element
        const wrapper = block.querySelector('.project-carousel-wrapper');
        // Query all slides inside the container
        const items = block.querySelectorAll('.project-carousel-item');
        // Get left navigation arrow button
        const prevBtn = block.querySelector('.prev-btn');
        // Get right navigation arrow button
        const nextBtn = block.querySelector('.next-btn');

        // Exit initialization if wrapper is missing or only 1 item exists
        if (!wrapper || items.length <= 1) return;

        // Total real slides count
        const total = items.length;

        // Clone first and last items for seamless infinite looping
        const firstClone = items[0].cloneNode(true);
        const lastClone = items[total - 1].cloneNode(true);
        
        // Add clone marker classes
        firstClone.classList.add('carousel-clone');
        lastClone.classList.add('carousel-clone');

        // Append first clone to the very end of container
        wrapper.appendChild(firstClone);
        // Prepend last clone to the very start of container
        wrapper.insertBefore(lastClone, items[0]);

        // Start index at 1 (representing the first real slide)
        let activeIdx = 1;
        // Flag to prevent overlapping click interactions
        let isTransitioning = false;
        // Interval timer placeholder for auto-scrolling
        let intervalId = null;

        // Fetch display width of a single carousel block viewport
        const getItemWidth = () => wrapper.offsetWidth;

        // Set initial scroll position to show first real slide
        const resetPosition = () => {
            // Get current viewport width
            const width = getItemWidth();
            // Snap container scroll offset to first real slide
            wrapper.scrollLeft = activeIdx * width;
        };

        // Delay slightly to ensure layout is ready
        setTimeout(resetPosition, 100);
        // Bind resize listener to recalibrate width snaps on screen changes
        window.addEventListener('resize', resetPosition);

        // Scroll layout container smoothly to target index
        const scrollToSlide = (idx, smooth = true) => {
            // Set transition lock flag
            isTransitioning = true;
            // Get viewport width
            const width = getItemWidth();
            // Scroll wrapper view to coordinates
            wrapper.scrollTo({
                left: idx * width,
                behavior: smooth ? 'smooth' : 'auto'
            });
            // Update active index tracker coordinate
            activeIdx = idx;

            // Wait for transition to complete (600ms), then teleport if boundary is hit
            setTimeout(() => {
                // Get active item width
                const currentWidth = getItemWidth();
                // If scrolled left into the prepended last clone
                if (activeIdx === 0) {
                    // Teleport index instantly to the real last slide
                    activeIdx = total;
                    // Snap scroll position without visible animations
                    wrapper.scrollTo({ left: activeIdx * currentWidth, behavior: 'auto' });
                // If scrolled right into the appended first clone
                } else if (activeIdx === total + 1) {
                    // Teleport index instantly to the real first slide
                    activeIdx = 1;
                    // Snap scroll position without visible animations
                    wrapper.scrollTo({ left: activeIdx * currentWidth, behavior: 'auto' });
                }
                // Release interaction transition lock
                isTransitioning = false;
            }, 600);
        };

        // Click handler to slide next
        const handleNext = () => {
            // Skip if transition lock is active
            if (isTransitioning) return;
            // Slide to next item index coordinates
            scrollToSlide(activeIdx + 1, true);
        };

        // Click handler to slide prev
        const handlePrev = () => {
            // Skip if transition lock is active
            if (isTransitioning) return;
            // Slide to previous item index coordinates
            scrollToSlide(activeIdx - 1, true);
        };

        // Configure auto scrolling interval
        const startAutoScroll = () => {
            // Set interval timer loop for 4 seconds
            intervalId = setInterval(handleNext, 4000);
        };

        // Deactivate auto scrolling interval
        const stopAutoScroll = () => {
            // If active interval timer exists
            if (intervalId) {
                // Clear interval task from CPU
                clearInterval(intervalId);
                // Clear state reference
                intervalId = null;
            }
        };

        // Start auto slider initially
        startAutoScroll();

        // Bind clicks to buttons
        if (prevBtn) {
            // Click listener for left navigation button
            prevBtn.addEventListener('click', () => {
                // Halt auto sliding on user action
                stopAutoScroll();
                // Slide previous
                handlePrev();
            });
        }

        if (nextBtn) {
            // Click listener for right navigation button
            nextBtn.addEventListener('click', () => {
                // Halt auto sliding on user action
                stopAutoScroll();
                // Slide next
                handleNext();
            });
        }

        // Pause auto scroll when user interacts manually via touch or mouse drag
        wrapper.addEventListener('touchstart', stopAutoScroll, { passive: true });
        wrapper.addEventListener('mousedown', stopAutoScroll);
    });
});

// --- 7. IMMERSIVE LIGHTBOX GALLERY SYSTEM (LOOPING & KEYBOARD BINDINGS) ---
// Global array holding source paths for images in the active block gallery
let currentGalleryImages = [];
// Global index tracking the active picture inside lightbox viewer
let currentGalleryIdx = 0;

// Open full screen image overlay modal and populate gallery arrays
function openLightbox(blockId, idx) {
    // Get target project section container
    const block = document.getElementById(blockId);
    // Get lightbox wrapper container
    const lightbox = document.getElementById('lightbox');
    // Get lightbox main image tag
    const lightboxImg = document.getElementById('lightbox-img');
    // Exit if any critical components are missing
    if (!block || !lightbox || !lightboxImg) return;
    
    // Select all original images (excluding clones)
    const imgEls = Array.from(block.querySelectorAll('.project-carousel-item:not(.carousel-clone) img'));
    // Exit if no images found inside
    if (imgEls.length === 0) return;
    
    // Extract raw image URLs
    currentGalleryImages = imgEls.map(img => img.src);
    
    // Set target startup image index
    currentGalleryIdx = idx;
    
    // Set layout overlay display block visibility
    lightbox.style.display = 'flex';
    // Lock background scroll behavior on body container
    document.body.style.overflow = 'hidden';
    
    // Load start image and render dot indicators
    updateLightboxImage();
    
    // Apply active transition class after short timeout (20ms) for rendering paint
    setTimeout(() => {
        // Add class to trigger fade-in transition
        lightbox.classList.add('active');
    }, 20);
}

// Fade out image container, swap source URL, then fade in smoothly
function updateLightboxImage() {
    // Get lightbox image tag
    const lightboxImg = document.getElementById('lightbox-img');
    // Exit if tag is missing or gallery list is empty
    if (!lightboxImg || currentGalleryImages.length === 0) return;
    
    // Set opacity to zero to prepare for image swap transition
    lightboxImg.style.opacity = '0';
    
    // Wait for fade transition, then replace source and fade back in
    setTimeout(() => {
        // Update image source path
        lightboxImg.src = currentGalleryImages[currentGalleryIdx];
        // Fade in new image
        lightboxImg.style.opacity = '1';
        
        // Render indicator dots at the bottom of viewport
        renderLightboxDots();
    }, 150);
}

// Render dynamic indicator dots using sliding window strategy (capped at 3 dots)
function renderLightboxDots() {
    // Get container for dots list
    const lightboxDotsContainer = document.getElementById('lightbox-dots');
    // Exit if container is missing
    if (!lightboxDotsContainer) return;
    // Clear previous dot elements
    lightboxDotsContainer.innerHTML = '';
    
    // Total gallery images
    const total = currentGalleryImages.length;
    // Hide dots completely if only 1 image exists
    if (total <= 1) return;
    
    // Special layout rule: if exactly 2 images exist, render 2 indicators
    if (total === 2) {
        // Loop through 2 items
        for (let idx = 0; idx < 2; idx++) {
            // Create dot span element
            const dot = document.createElement('span');
            // Apply styling class name
            dot.className = 'lightbox-dot';
            // Add active class if dot matches active index
            if (idx === currentGalleryIdx) {
                dot.classList.add('active');
            }
            // Bind click to load target image
            dot.addEventListener('click', () => {
                // Set active index
                currentGalleryIdx = idx;
                // Swap image source
                updateLightboxImage();
            });
            // Append dot to container
            lightboxDotsContainer.appendChild(dot);
        }
        // Exit function
        return;
    }
    
    // For total >= 3, always render exactly 3 dots representing a sliding window
    for (let d = 0; d < 3; d++) {
        // Create dot span element
        const dot = document.createElement('span');
        // Apply styling class name
        dot.className = 'lightbox-dot';
        
        // Calculate the actual image index mapped to this dot
        let targetIdx;
        if (currentGalleryIdx === 0) {
            // First image active: dots represent image 0, 1, 2
            targetIdx = d;
        } else if (currentGalleryIdx === total - 1) {
            // Last image active: dots represent last three images
            targetIdx = total - 3 + d;
        } else {
            // Middle image active: dots represent image before, current, image after
            targetIdx = currentGalleryIdx - 1 + d;
        }
        
        // Highlight active dot
        if (targetIdx === currentGalleryIdx) {
            dot.classList.add('active');
        }
        
        // Bind click handler to select target image on click
        dot.addEventListener('click', () => {
            // Update active index
            currentGalleryIdx = targetIdx;
            // Redraw image
            updateLightboxImage();
        });
        
        // Append dot item to DOM container
        lightboxDotsContainer.appendChild(dot);
    }
}

// Load next image inside lightbox list
function nextLightboxImage() {
    // Exit if gallery holds 1 or fewer items
    if (currentGalleryImages.length <= 1) return;
    // Increment index, looping back to start if end is reached
    currentGalleryIdx = (currentGalleryIdx + 1) % currentGalleryImages.length;
    // Swap image source view
    updateLightboxImage();
}

// Load previous image inside lightbox list
function prevLightboxImage() {
    // Exit if gallery holds 1 or fewer items
    if (currentGalleryImages.length <= 1) return;
    // Decrement index, looping back to end if start is crossed
    currentGalleryIdx = (currentGalleryIdx - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    // Swap image source view
    updateLightboxImage();
}

// Fade out and close lightbox modal overlay
function closeLightbox() {
    // Get lightbox wrapper container
    const lightbox = document.getElementById('lightbox');
    // Get lightbox image element
    const lightboxImg = document.getElementById('lightbox-img');
    // Get lightbox indicator dots container
    const lightboxDotsContainer = document.getElementById('lightbox-dots');
    // Exit if container is missing
    if (!lightbox) return;
    
    // Remove active transition class for fade-out animation
    lightbox.classList.remove('active');
    // Restore normal scrolling flow on body container
    document.body.style.overflow = '';
    
    // Wait for transition to complete (500ms), then clear assets and hide
    setTimeout(() => {
        // Set display to none to remove from paint flow
        lightbox.style.display = 'none';
        // Clear image source to free device memory
        if (lightboxImg) lightboxImg.src = '';
        // Clear dots elements
        if (lightboxDotsContainer) lightboxDotsContainer.innerHTML = '';
    }, 500);
}

// Bind lightbox actions to window namespace for inline HTML button triggers
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextLightboxImage = nextLightboxImage;
window.prevLightboxImage = prevLightboxImage;

// Add global listeners when script executes inside sandbox closure
(() => {
    // Listen for DOMContentLoaded to initialize lightbox handlers
    document.addEventListener('DOMContentLoaded', () => {
        // Get lightbox DOM reference
        const lightbox = document.getElementById('lightbox');
        // Verify container exists
        if (lightbox) {
            // Close lightbox on click outside the image content wrapper bounds
            lightbox.addEventListener('click', (e) => {
                // If target matches outer backdrop container or wrapper padding
                if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                    // Close overlay view
                    closeLightbox();
                }
            });

            // Keyboard bindings (Arrow keys & Escape)
            document.addEventListener('keydown', (e) => {
                // Exit if lightbox is not active
                if (!lightbox.classList.contains('active')) return;
                
                // Escape key closes modal
                if (e.key === 'Escape') {
                    closeLightbox();
                // Right arrow key loads next image
                } else if (e.key === 'ArrowRight') {
                    nextLightboxImage();
                // Left arrow key loads previous image
                } else if (e.key === 'ArrowLeft') {
                    prevLightboxImage();
                }
            });

            // Mobile finger swipe gestures
            let touchStartX = 0;
            let touchEndX = 0;

            // Touch start event coordinates
            lightbox.addEventListener('touchstart', (e) => {
                // Record starting position
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            // Touch end event coordinates comparison
            lightbox.addEventListener('touchend', (e) => {
                // Record ending position
                touchEndX = e.changedTouches[0].screenX;
                // Min swipe length threshold (50px)
                const swipeThreshold = 50;
                // If swipe left is longer than threshold
                if (touchEndX < touchStartX - swipeThreshold) {
                    // Load next image
                    nextLightboxImage();
                // If swipe right is longer than threshold
                } else if (touchEndX > touchStartX + swipeThreshold) {
                    // Load previous image
                    prevLightboxImage();
                }
            }, { passive: true });

            // Intercept local page link clicks to handle smooth page-out transitions
            document.body.addEventListener('click', (e) => {
                // Get the closest clicked anchor element
                const link = e.target.closest('a');
                // Exit if not an anchor link
                if (!link) return;
                
                // Get destination href attribute
                let href = link.getAttribute('href');
                // Exit if href is empty
                if (!href) return;
                
                // Check if target is on the same domain/origin
                const isLocalPage = link.hostname === window.location.hostname;
                // Check if target is a simple anchor jump inside current page
                const isAnchorOnly = href.startsWith('#');
                // Check if target is an external website page, email, phone, or whatsapp link
                const isExternal = link.target === '_blank' || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me');
                
                // If link is local page, but not anchor and not external, and clicked without modifiers
                if (isLocalPage && !isAnchorOnly && !isExternal && !e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey) {
                    // Stop standard navigation
                    e.preventDefault();
                    
                    // Add fade-out transition class to body
                    document.body.classList.add('page-transitioning-out');
                    
                    // Navigate window to target URL after fade out delay
                    setTimeout(() => {
                        window.location.href = href;
                    }, 500);
                }
            });
        }
    });
})();

// --- 8. IMAGE DOWNLOAD PROTECTION SYSTEM ---
// Disable right-click options globally across the entire document
document.addEventListener('contextmenu', (e) => {
    // Block context menu display
    e.preventDefault();
});

// Disable image dragging globally across the entire document
document.addEventListener('dragstart', (e) => {
    // Block image drag operations
    e.preventDefault();
});
