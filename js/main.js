/* ============================================
   CHONGQING HIKES - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger to X
            const spans = navToggle.querySelectorAll('span');
            navToggle.classList.toggle('active');
            
            if (navToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }
    
    // ============================================
    // Navbar Background on Scroll
    // ============================================
    const navbar = document.querySelector('.navbar');
    
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on load
    
    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            
            if (target) {
                e.preventDefault();
                
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================
    // Scroll Animations
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature, .testimonial, .path-card').forEach(el => {
        observer.observe(el);
    });
    
    // ============================================
    // Active Navigation Link
    // ============================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
    
    // ============================================
    // Video Embed Handler (for future TikTok/YouTube)
    // ============================================
    function embedVideo(platform, videoId, container) {
        const videoContainer = document.querySelector(container);
        
        if (!videoContainer) return;
        
        if (platform === 'youtube') {
            videoContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        } else if (platform === 'tiktok') {
            videoContainer.innerHTML = `
                <blockquote class="tiktok-embed" cite="https://www.tiktok.com/@chongqinghikes/video/${videoId}" data-video-id="${videoId}">
                    <a href="https://www.tiktok.com/@chongqinghikes/video/${videoId}">Watch on TikTok</a>
                </blockquote>
                <script async src="https://www.tiktok.com/embed.js"></script>
            `;
        }
    }
    
    // ============================================
    // Form Handling (for contact page)
    // ============================================
    const contactForm = document.querySelector('#contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Here you would normally send to a backend
            // For now, we'll open WhatsApp with the message
            
            const message = `Hi Ryan! I'm interested in booking a tour.\n\nName: ${data.name}\nEmail: ${data.email}\nTour: ${data.tour || 'Not specified'}\nMessage: ${data.message || 'No message'}`;
            
            const whatsappUrl = `https://wa.me/8615696078461?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappUrl, '_blank');
        });
    }
    
    // ============================================
    // Image Lazy Loading (for future images)
    // ============================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // ============================================
    // Console Welcome Message
    // ============================================
    console.log('%c🏔️ Chongqing Hikes', 'font-size: 24px; font-weight: bold; color: #ff6b35;');
    console.log('%cExplore the 8D City & Wild Mountains', 'font-size: 14px; color: #b0b8c1;');
    console.log('%cBuilt with ❤️ for adventure seekers', 'font-size: 12px; color: #6b7280;');
    
});
