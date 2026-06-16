const languageToggle = document.getElementById('languageToggle');
let currentLanguage = 'en';

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ta' : 'en';
    updateLanguage();
}

function updateLanguage() {
    document.querySelectorAll('[data-en]').forEach(element => {
        if (currentLanguage === 'en') {
            element.textContent = element.getAttribute('data-en');
        } else {
            element.textContent = element.getAttribute('data-ta');
        }
    });

    const toggleText = languageToggle.querySelector('span');
    if (currentLanguage === 'en') {
        toggleText.textContent = 'Tamil';
    } else {
        toggleText.textContent = 'English';
    }
}

languageToggle.addEventListener('click', toggleLanguage);

window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

const galleryTrack = document.querySelector('.gallery-track');
const gallerySlides = document.querySelectorAll('.gallery-slide');
const galleryDots = document.querySelectorAll('.gallery-dot');
const prevBtn = document.querySelector('.gallery-control.prev');
const nextBtn = document.querySelector('.gallery-control.next');
let currentSlide = 0;
const slideCount = gallerySlides.length;

function goToSlide(index) {
    galleryTrack.style.transform = `translateX(-${index * 100}%)`;

    gallerySlides.forEach(slide => slide.classList.remove('active'));
    gallerySlides[index].classList.add('active');

    galleryDots.forEach(dot => dot.classList.remove('active'));
    galleryDots[index].classList.add('active');

    currentSlide = index;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slideCount;
    goToSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    goToSlide(currentSlide);
}

let slideInterval = setInterval(nextSlide, 5000);

const galleryContainer = document.querySelector('.gallery-container');
galleryContainer.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
});

galleryContainer.addEventListener('mouseleave', () => {
    slideInterval = setInterval(nextSlide, 5000);
});

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

galleryDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        goToSlide(index);
    });
});

// --- Dynamic Programs Loading ---
async function loadDynamicPrograms() {
    try {
        const res = await fetch('/api/programs');
        const programs = await res.json();
        const grid = document.getElementById('dynamicProgramsGrid');
        if (!grid || !programs.length) return;

        grid.innerHTML = programs.map(p => `
            <div class="program-card" data-category="${p.category}">
                <div class="program-img">
                    <img src="${p.image}" alt="${p.title}">
                </div>
                <div class="program-content">
                    <h3 data-en="${p.title}" data-ta="${p.titleTa || p.title}">${currentLanguage === 'ta' ? (p.titleTa || p.title) : p.title}</h3>
                    <p data-en="${p.description}" data-ta="${p.descriptionTa || p.description}">${currentLanguage === 'ta' ? (p.descriptionTa || p.description) : p.description}</p>
                    <a href="#" class="btn" data-en="Read More" data-ta="மேலும் படிக்க">${currentLanguage === 'ta' ? 'மேலும் படிக்க' : 'Read More'}</a>
                </div>
            </div>
        `).join('');

        // Re-bind category filters
        bindCategoryFilters();
        // Re-init scroll animations for new cards
        initScrollAnimations();
    } catch (err) {
        console.error('Failed to load programs:', err);
    }
}

function bindCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const programCards = document.querySelectorAll('.program-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            programCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// --- Dynamic Gallery Loading ---
async function loadDynamicGallery() {
    try {
        const res = await fetch('/api/gallery');
        const images = await res.json();
        const container = document.getElementById('dynamicFloatingGallery');
        if (!container || !images.length) return;

        const perPage = 12;
        let galleryPage = 0;
        const totalPages = Math.ceil(images.length / perPage);

        function renderGalleryPage() {
            const start = galleryPage * perPage;
            const pageImages = images.slice(start, start + perPage);
            const grid = document.getElementById('galleryGrid');
            if (grid) {
                grid.innerHTML = pageImages.map((img, i) => `
                    <div class="floating-img animate">
                        <img src="${img}" alt="Gallery Image ${start + i + 1}" class="zoomable">
                        <div class="floating-overlay">
                            <i class="fas fa-search-plus"></i>
                        </div>
                    </div>
                `).join('');
            }
            // Update button states
            const prevBtn = document.getElementById('galleryPrev');
            const nextBtn = document.getElementById('galleryNext');
            const pageInfo = document.getElementById('galleryPageInfo');
            if (prevBtn) prevBtn.classList.toggle('disabled', galleryPage === 0);
            if (nextBtn) nextBtn.classList.toggle('disabled', galleryPage >= totalPages - 1);
            if (pageInfo) pageInfo.textContent = `${galleryPage + 1} / ${totalPages}`;
            bindZoomableImages();
        }

        container.innerHTML = `
            <div class="gallery-nav-bar">
                <button class="gallery-nav-btn" id="galleryPrev"><i class="fas fa-chevron-left"></i> Prev</button>
                <span class="gallery-page-info" id="galleryPageInfo">1 / ${totalPages}</span>
                <button class="gallery-nav-btn" id="galleryNext">Next <i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="floating-gallery-grid" id="galleryGrid"></div>
        `;

        document.getElementById('galleryPrev').addEventListener('click', () => {
            if (galleryPage > 0) { galleryPage--; renderGalleryPage(); }
        });
        document.getElementById('galleryNext').addEventListener('click', () => {
            if (galleryPage < totalPages - 1) { galleryPage++; renderGalleryPage(); }
        });

        renderGalleryPage();
    } catch (err) {
        console.error('Failed to load gallery:', err);
    }
}

function bindZoomableImages() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    document.querySelectorAll('.zoomable:not([data-zoom-bound])').forEach(img => {
        img.setAttribute('data-zoom-bound', 'true');
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            modal.style.display = 'flex';
            modalImg.src = this.src;
        });
    });
}

// --- Dynamic Events Loading ---
async function loadDynamicEvents() {
    try {
        const res = await fetch('/api/events');
        const events = await res.json();
        const today = new Date().toISOString().split('T')[0];

        const upcoming = events.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
        const past = events.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date));

        const upcomingContainer = document.getElementById('upcomingEventsContainer');
        const pastContainer = document.getElementById('pastEventsContainer');

        if (upcomingContainer) {
            if (upcoming.length) {
                upcomingContainer.innerHTML = upcoming.map(ev => `
                    <div class="announcement-poster">
                        <img src="${ev.image}" alt="${ev.title}" class="zoomable">
                    </div>
                `).join('');
            } else {
                upcomingContainer.innerHTML = '<p style="text-align:center;color:#64748b;">No upcoming events at the moment.</p>';
            }
        }

        if (pastContainer) {
            if (past.length) {
                pastContainer.innerHTML = past.map(ev => {
                    const d = new Date(ev.date + 'T00:00:00');
                    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    return `
                    <div class="past-event-thumb">
                        <img src="${ev.image}" alt="${ev.title}" class="zoomable">
                        <div class="past-event-info">
                            <span class="past-event-title">${ev.title}</span>
                            <span class="past-event-date"><i class="fas fa-calendar-alt"></i> ${dateStr}</span>
                        </div>
                    </div>`;
                }).join('');
            } else {
                pastContainer.innerHTML = '<p style="text-align:center;color:#64748b;">No past events.</p>';
            }
        }

        // Re-bind zoomable images for event posters
        bindZoomableImages();

        // Hide the upcoming section entirely if empty
        const upcomingSection = document.getElementById('announcements');
        if (upcomingSection && !upcoming.length) {
            upcomingSection.style.display = 'none';
        } else if (upcomingSection) {
            upcomingSection.style.display = '';
        }
    } catch (err) {
        console.error('Failed to load events:', err);
    }
}

// Modern IntersectionObserver for scroll animations
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger animations for sibling elements
            const delay = entry.target.dataset.animDelay || 0;
            setTimeout(() => {
                entry.target.classList.add('animate');
            }, delay);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
});

function initScrollAnimations() {
    const elements = document.querySelectorAll('.about-img, .about-text, .program-card, .stat, .floating-img');
    elements.forEach((element, index) => {
        // Add staggered delay for grid items
        if (element.classList.contains('program-card') || element.classList.contains('stat') || element.classList.contains('floating-img')) {
            element.dataset.animDelay = (index % 6) * 100;
        }
        animationObserver.observe(element);
    });
}

document.addEventListener('DOMContentLoaded', initScrollAnimations);
window.addEventListener('load', initScrollAnimations);

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim()
    };
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = currentLanguage === 'en' ? 'Sending...' : 'அனுப்பு...';
    
    // Send data to Node.js backend
    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Success message
            alert(currentLanguage === 'en' 
                ? 'Thank you for your message! We will get back to you soon.' 
                : 'உங்கள் செய்திக்கு நன்றி! விரைவில் உங்களுக்கு பதிலளிப்போம்.');
            this.reset();
        } else {
            // Error message
            alert(currentLanguage === 'en' 
                ? 'Error: ' + data.message 
                : 'பிழை: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(currentLanguage === 'en' 
            ? 'An error occurred. Please try again.' 
            : 'ஒரு பிழை ஏற்பட்டது. மீண்டும் முயற்சி செய்யவும்.');
    })
    .finally(() => {
        // Re-enable button and restore original text
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    });
});

function createHeroSlideshow() {
    const slideshowContainer = document.getElementById('heroBgSlideshow');
    const images = [
        'img/1.jpg',
        'img/2.jpg',
        'img/3.jpg',
        'img/4.jpg',
        'img/5.jpg',
        'img/8.jpg',
        'img/9.jpg',
        'img/a1.jpg',
        'img/81.jpg',
        'img/a2.jpg',
        'img/a3.jpg',
        'img/a4.jpg',
        'img/a5.jpg',
        'img/a6.jpg',
        'img/a7.jpg',
        'img/a8.jpg',
        'img/news1.jpg',
        'img/a9.jpg',
        'img/a10.jpg',
        'img/a12.jpg',
        'img/a11.jpg',
        'img/a13.jpg',
        'img/a14.jpg',
        'img/a15.jpg',
        'img/a16.jpg',
        'img/a17.jpg',
        'img/a18.jpg',
        'img/a19.jpg',
        'img/a20.jpg',
        'img/a22.jpg',
        'img/a21.jpg',
        'img/a23.jpg',
        'img/a24.jpg',
        'img/a25.jpg',
        'img/a26.jpg',
        'img/a27.jpg',
        'img/a28.jpg',
        'img/a29.jpg',
        'img/a30.jpg',
        'img/a31.jpg',
        'img/a32.jpg',
        'img/a33.jpg',
        'img/a34.jpg',
        'img/a35.jpg',
        'img/a36.jpg',
        'img/a37.jpg',
        'img/a38.jpg',
        'img/t1.jpg',
        'img/m.jpg',
        'img/y1.jpg',
        'img/y2.jpg',
        'img/10.jpg'
    ];

    images.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'hero-bg-slide';
        slide.style.backgroundImage = `url(${image})`;

        if (index === 0) {
            slide.classList.add('active');
        }

        slideshowContainer.appendChild(slide);
    });

    let currentSlideIndex = 0;
    const slides = document.querySelectorAll('.hero-bg-slide');

    setInterval(() => {
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close-modal');

    document.querySelectorAll('.zoomable').forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = 'flex';
            modalImg.src = this.src;
        });
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
});

window.addEventListener('load', function() {
    createHeroSlideshow();
    loadDynamicPrograms();
    loadDynamicGallery();
    loadDynamicEvents();
    initScrollAnimations();
});
