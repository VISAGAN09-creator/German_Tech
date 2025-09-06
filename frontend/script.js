// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const header = document.querySelector('.header');

// Mobile Navigation Toggle
hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
    });
});

// Header Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header?.classList.add('scrolled');
    } else {
        header?.classList.remove('scrolled');
    }
});

// Image Slider for Hero Section
class ImageSlider {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.nextBtn = document.querySelector('.next-btn');
        this.prevBtn = document.querySelector('.prev-btn');
        
        if (this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        // Auto slide every 5 seconds
        setInterval(() => {
            this.nextSlide();
        }, 5000);
        
        // Navigation buttons
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
    }
    
    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(this.currentSlide);
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(this.currentSlide);
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            // Small delay to ensure DOM is fully loaded before observing
            setTimeout(() => {
                this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerOptions);
                this.observeElements();
                // Force check for elements in viewport on initial load
                this.checkVisibleElements();
            }, 100);
        }
    }
    
    observeElements() {
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .slide-in-up');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = this.getInitialTransform(el);
            this.observer.observe(el);
        });
    }
    
    getInitialTransform(element) {
        if (element.classList.contains('slide-in-left')) return 'translateX(-50px)';
        if (element.classList.contains('slide-in-right')) return 'translateX(50px)';
        if (element.classList.contains('slide-in-up')) return 'translateY(50px)';
        return 'translateY(30px)';
    }
    
    // Check for elements already in viewport
    checkVisibleElements() {
        const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .slide-in-up');
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
            
            if (isVisible && !el.classList.contains('animated')) {
                el.style.opacity = '1';
                el.style.transform = 'translate(0)';
                el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                el.classList.add('animated');
            }
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translate(0)';
                entry.target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                entry.target.classList.add('animated');
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// Form Handler
class FormHandler {
    constructor() {
        this.form = document.getElementById('serviceBookingForm');
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.setupValidation();
        this.setupDateRestrictions();
    }
    
    setupDateRestrictions() {
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            dateInput.min = tomorrow.toISOString().split('T')[0];
        }
    }
    
    setupValidation() {
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', this.validateField.bind(this));
        });
    }
    
    validateField(event) {
        const field = event.target;
        const isValid = field.checkValidity();
        
        field.style.borderColor = isValid ? '#cbd5e1' : '#ef4444';
        
        if (!isValid && !field.nextElementSibling?.classList.contains('error-message')) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.color = '#ef4444';
            errorMsg.style.fontSize = '0.875rem';
            errorMsg.style.marginTop = '0.25rem';
            errorMsg.textContent = field.validationMessage;
            field.parentNode.appendChild(errorMsg);
        } else if (isValid && field.nextElementSibling?.classList.contains('error-message')) {
            field.nextElementSibling.remove();
        }
    }
    
    handleSubmit(event) {
        event.preventDefault();
        this.clearAllErrors(); // Clear previous errors

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting...';

        const formData = new FormData(this.form);
        const services = Array.from(this.form.querySelectorAll('input[name="servicesNeeded"]:checked')).map(cb => cb.value);
        if (services.length === 0) {
            alert('Please select at least one service.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }
        formData.delete('servicesNeeded');
        formData.append('servicesNeeded', services.join(', '));

        if (!formData.has('pickupService')) {
            formData.append('pickupService', 'no');
        }

        const formContainer = this.form.closest('.booking-form');
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner"></div><p>Submitting your booking...</p>';
        formContainer.appendChild(loadingIndicator);

        fetch('submit_booking.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                // Pass both status and the promise for the body to the next handler
                return Promise.reject({ status: response.status, body: response.json() });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showSuccessMessage();
                this.form.reset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // This handles validation errors (e.g., 422) returned with success:false
                this.showFormErrors(data.errors || [data.message]);
            }
        })
        .catch(err => {
            if (err.status && err.body) {
                err.body.then(errorData => {
                    // Handle 'slot full' error specifically
                    if (err.status === 409) {
                        this.showFieldError('timeSlot', errorData.message);
                    } else {
                        // Handle other server errors
                        this.showFormErrors([errorData.message || 'An unknown server error occurred.']);
                    }
                });
            } else {
                // Handle network errors or other exceptions
                console.error('Booking submission error:', err);
                this.showFormErrors([err.message || 'A network error occurred. Please try again.']);
            }
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            if (loadingIndicator.parentNode === formContainer) {
                formContainer.removeChild(loadingIndicator);
            }
        });
    }
    
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const errorElement = document.createElement('div');
        errorElement.className = 'field-error-message';
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '0.9em';
        errorElement.style.marginTop = '5px';
        errorElement.textContent = message;

        // Insert after the field's parent if it's a checkbox/radio group, otherwise after the field itself
        const targetElement = field.closest('.checkbox-group') || field;
        targetElement.parentNode.insertBefore(errorElement, targetElement.nextSibling);
    }

    showFormErrors(errors) {
        const formErrorElement = document.createElement('div');
        formErrorElement.className = 'form-error-summary';
        formErrorElement.style.color = '#e74c3c';
        formErrorElement.style.marginBottom = '15px';
        formErrorElement.innerHTML = errors.map(e => `<p>${e}</p>`).join('');
        this.form.prepend(formErrorElement);
    }

    clearAllErrors() {
        this.form.querySelectorAll('.field-error-message, .form-error-summary').forEach(el => el.remove());
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            animation: slideInRight 0.5s ease-out;
        `;
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle"></i>
                <span>Thank you! We'll contact you within 2 hours to confirm your appointment.</span>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => successDiv.remove(), 500);
        }, 5000);
    }
}

// Smooth Scrolling for Internal Links
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Loading Animation
class LoadingAnimation {
    constructor() {
        this.init();
    }
    
    init() {
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            this.animateCounters();
        });
    }
    
    animateCounters() {
        const counters = document.querySelectorAll('.stat-card h3');
        counters.forEach(counter => {
            const target = counter.textContent;
            const numericTarget = parseInt(target.replace(/[^0-9]/g, ''));
            
            if (!isNaN(numericTarget) && numericTarget > 0) {
                this.animateCounter(counter, numericTarget, target);
            }
        });
    }
    
    animateCounter(element, target, originalText) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = originalText;
                clearInterval(timer);
            } else {
                const prefix = originalText.match(/^\D+/) ? originalText.match(/^\D+/)[0] : '';
                const suffix = originalText.match(/\D+$/) ? originalText.match(/\D+$/)[0] : '';
                element.textContent = prefix + Math.floor(current) + suffix;
            }
        }, 20);
    }
}

// Gallery Lightbox (for garage tour images)
class GalleryLightbox {
    constructor() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        if (this.galleryItems.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => this.openLightbox(index));
        });
    }
    
    openLightbox(index) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        const img = this.galleryItems[index].querySelector('img');
        const lightboxImg = document.createElement('img');
        lightboxImg.src = img.src;
        lightboxImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 12px;
        `;
        
        lightbox.appendChild(lightboxImg);
        document.body.appendChild(lightbox);
        
        lightbox.addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
        
        // Close on escape key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(lightbox);
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }
}

// Performance Optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        // Lazy load images
        this.lazyLoadImages();
        
        // Debounce scroll events
        this.debounceScrollEvents();
    }
    
    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    debounceScrollEvents() {
        let ticking = false;
        const updateScrollEffects = () => {
            // Update any scroll-based effects here
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageSlider();
    new ScrollAnimations();
    new FormHandler();
    new SmoothScroll();
    new LoadingAnimation();
    new GalleryLightbox();
    new PerformanceOptimizer();
});

// Add some custom styles for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
    
    .error-message {
        animation: fadeIn 0.3s ease-out;
    }
    
    body.loaded .fade-in {
        animation-delay: 0.2s;
    }
    
    body.loaded .slide-in-left {
        animation-delay: 0.4s;
    }
    
    body.loaded .slide-in-right {
        animation-delay: 0.6s;
    }
    
    body.loaded .slide-in-up {
        animation-delay: 0.8s;
    }
`;
document.head.appendChild(style);