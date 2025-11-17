// ========================================
// Advanced Portfolio Animation System
// Using JavaScript & DOM Manipulation
// ========================================

class PortfolioAnimator {
  constructor() {
    this.init();
  }

  init() {
    this.initParticles();
    this.initScrollProgress();
    this.initMobileMenu();
    this.initSmoothScroll();
    this.initScrollAnimations();
    this.initCounterAnimation();
    this.initTypingEffect();
    this.initBackToTop();
    this.initCursorEffect();
    this.initSkillProgress();
    this.initTextScramble();
    this.initParallax();
    this.initMagneticButtons();
    this.initGlitchEffect();
    this.initColorShift();
    this.initProjectFilters();
    this.initLazyLoading();
    this.initFormValidation();
    this.initThemeToggle();
    this.initNavbarScroll();
    this.initTiltEffect();
  }

  // ========================================
  // Particles.js Configuration
  // ========================================
  initParticles() {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: { value: 100, density: { enable: true, value_area: 800 } },
          color: { value: ['#00d9ff', '#6366f1', '#ec4899'] },
          shape: { type: ['circle', 'triangle', 'edge'] },
          opacity: { 
            value: 0.6, 
            random: true,
            anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
          },
          size: { 
            value: 4, 
            random: true,
            anim: { enable: true, speed: 3, size_min: 0.1, sync: false }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#00d9ff',
            opacity: 0.3,
            width: 1
          },
          move: { 
            enable: true, 
            speed: 2, 
            direction: 'none', 
            random: true, 
            straight: false, 
            out_mode: 'out', 
            bounce: false,
            attract: { enable: true, rotateX: 600, rotateY: 1200 }
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: { 
            onhover: { enable: true, mode: 'bubble' }, 
            onclick: { enable: true, mode: 'repulse' }, 
            resize: true 
          },
          modes: { 
            bubble: { distance: 200, size: 6, duration: 2, opacity: 0.8 },
            repulse: { distance: 150, duration: 0.4 },
            push: { particles_nb: 4 },
            remove: { particles_nb: 2 }
          }
        },
        retina_detect: true
      });
    }
  }

  // ========================================
  // Scroll Progress Bar with Color Animation
  // ========================================
  initScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      scrollProgress.style.width = scrollPercent + '%';
      
      // Change color based on scroll position
      const hue = (scrollPercent * 3.6);
      scrollProgress.style.background = `linear-gradient(90deg, hsl(${hue}, 100%, 50%), hsl(${hue + 60}, 100%, 50%))`;
    });
  }

  // ========================================
  // Enhanced Mobile Menu with Animations
  // ========================================
  initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');

    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');

      // Animate menu items
      navItems.forEach((item, index) => {
        if (navLinks.classList.contains('active')) {
          item.style.animation = `slideIn 0.5s ease forwards ${index * 0.1}s`;
        } else {
          item.style.animation = '';
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
  }

  // ========================================
  // Smooth Scroll with Easing
  // ========================================
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        
        if (target) {
          const offset = 80;
          const targetPosition = target.offsetTop - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          document.querySelector('.nav-links').classList.remove('active');
          document.querySelector('.hamburger').classList.remove('active');
        }
      });
    });
  }

  // ========================================
  // Scroll-based Reveal Animations
  // ========================================
  initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal-animation');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Add stagger effect for children
          const children = entry.target.children;
          Array.from(children).forEach((child, index) => {
            setTimeout(() => {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            }, index * 100);
          });
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(element => observer.observe(element));
  }

  // ========================================
  // Animated Counter
  // ========================================
  initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    let animated = false;

    const animateCounter = (counter) => {
      const target = +counter.getAttribute('data-target');
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target + '+';
        }
      };

      updateCounter();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          counters.forEach(counter => animateCounter(counter));
          animated = true;
        }
      });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats');
    if (statsSection) observer.observe(statsSection);
  }

  // ========================================
  // Typing Effect with Cursor
  // ========================================
  initTypingEffect() {
    const typingElement = document.querySelector('.typing-effect');
    if (!typingElement) return;

    const text = typingElement.textContent;
    typingElement.textContent = '';
    
    let charIndex = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    cursor.style.cssText = 'animation: blink 0.7s infinite; margin-left: 2px;';
    
    const typeChar = () => {
      if (charIndex < text.length) {
        typingElement.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, 100 + Math.random() * 100);
      } else {
        typingElement.appendChild(cursor);
      }
    };

    setTimeout(typeChar, 1000);
  }

  // ========================================
  // Back to Top Button with Animation
  // ========================================
  initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ========================================
  // Custom Cursor Effect
  // ========================================
  initCursorEffect() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border: 2px solid #00d9ff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.2s ease;
      mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      background: #00d9ff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.1s ease;
    `;
    document.body.appendChild(cursorDot);

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursorDot.style.left = (e.clientX + 7) + 'px';
      cursorDot.style.top = (e.clientY + 7) + 'px';
    });

    // Expand cursor on hover
    document.querySelectorAll('a, button, .btn').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursor.style.borderColor = '#ec4899';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.borderColor = '#00d9ff';
      });
    });
  }

  // ========================================
  // Skill Progress Bars Animation
  // ========================================
  initSkillProgress() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const width = bar.style.width;
          bar.style.width = '0';
          
          setTimeout(() => {
            bar.style.width = width;
          }, 200);
        }
      });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => observer.observe(bar));
  }

  // ========================================
  // Text Scramble Effect
  // ========================================
  initTextScramble() {
    const scrambleElements = document.querySelectorAll('.section-title');
    const chars = '!<>-_\\/[]{}—=+*^?#________';

    const scramble = (element) => {
      const originalText = element.textContent;
      let iteration = 0;
      
      const interval = setInterval(() => {
        element.textContent = originalText
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        
        if (iteration >= originalText.length) {
          clearInterval(interval);
        }
        
        iteration += 1 / 3;
      }, 30);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scramble(entry.target);
        }
      });
    }, { threshold: 0.5 });

    scrambleElements.forEach(el => observer.observe(el));
  }

  // ========================================
  // Parallax Scrolling Effect
  // ========================================
  initParallax() {
    const parallaxElements = document.querySelectorAll('.hero-image, .about-image');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // ========================================
  // Magnetic Button Effect
  // ========================================
  initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn, .project-card');
    
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ========================================
  // Glitch Effect on Hover
  // ========================================
  initGlitchEffect() {
    const glitchElements = document.querySelectorAll('.hero-text h1');
    
    glitchElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.classList.add('glitch');
        setTimeout(() => {
          element.classList.remove('glitch');
        }, 500);
      });
    });
  }

  // ========================================
  // Dynamic Color Shift
  // ========================================
  initColorShift() {
    const techIcons = document.querySelectorAll('.tech-icon');
    
    techIcons.forEach((icon, index) => {
      icon.style.animationDelay = `${index * 0.2}s`;
      
      icon.addEventListener('click', () => {
        const colors = ['#ff2d20', '#61dafb', '#2496ed', '#3776ab', '#ff9900', '#ec4899', '#10b981'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        icon.style.color = randomColor;
        icon.style.transform = 'scale(1.5) rotate(360deg)';
        
        setTimeout(() => {
          icon.style.transform = 'scale(1) rotate(0deg)';
        }, 500);
      });
    });
  }

  // ========================================
  // Project Filter Animation
  // ========================================
  initProjectFilters() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      
      card.addEventListener('mouseenter', () => {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(0, 217, 255, 0.3);
          transform: translate(-50%, -50%);
          animation: ripple-animation 0.6s ease-out;
        `;
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ========================================
  // Lazy Loading Images
  // ========================================
  initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }

  // ========================================
  // Form Validation with Animation
  // ========================================
  initFormValidation() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement.classList.remove('focused');
        }
      });
      
      input.addEventListener('input', () => {
        if (input.checkValidity()) {
          input.style.borderColor = '#10b981';
        } else {
          input.style.borderColor = '#ef4444';
        }
      });
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('.btn-send');
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      
      // Simulate form submission
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #00d9ff)';
        
        setTimeout(() => {
          form.reset();
          submitBtn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';
          submitBtn.style.background = '';
        }, 2000);
      }, 1500);
    });
  }

  // ========================================
  // Theme Toggle (Dark/Light Mode)
  // ========================================
  initThemeToggle() {
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--gradient-3);
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: var(--shadow-color);
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const icon = themeToggle.querySelector('i');
      
      if (document.body.classList.contains('light-mode')) {
        icon.className = 'fas fa-sun';
        themeToggle.style.transform = 'rotate(360deg)';
      } else {
        icon.className = 'fas fa-moon';
        themeToggle.style.transform = 'rotate(0deg)';
      }
    });
  }

  // ========================================
  // Navbar Scroll Effect
  // ========================================
  initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
      }
      
      if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
      } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
      }
      
      lastScroll = currentScroll;
    });
  }

  // ========================================
  // 3D Tilt Effect on Cards
  // ========================================
  initTiltEffect() {
    const cards = document.querySelectorAll('.skill-category, .project-card, .education-item');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }
}

// ========================================
// Additional CSS Animations (Injected)
// ========================================
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes ripple-animation {
    to {
      width: 500px;
      height: 500px;
      opacity: 0;
    }
  }

  .glitch {
    animation: glitch-animation 0.3s infinite;
  }

  @keyframes glitch-animation {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }

  .navbar.scroll-down {
    transform: translateY(-100%);
  }

  .navbar.scroll-up {
    transform: translateY(0);
    box-shadow: 0 10px 40px rgba(0, 217, 255, 0.3);
  }

  body.light-mode {
    --background-dark: #f8fafc;
    --background-light: #e2e8f0;
    --background-card: #ffffff;
    --text-primary: #0a0e27;
    --text-secondary: #475569;
    --border-color: #cbd5e1;
  }

  .form-group.focused .form-input {
    transform: translateY(-2px);
  }

  img.loaded {
    animation: fadeIn 0.5s ease;
  }

  .skill-category, .project-card, .education-item {
    transition: transform 0.1s ease;
  }
`;
document.head.appendChild(style);

// ========================================
// Initialize Portfolio Animator
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioAnimator();
  
  // Add loading animation
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);
});

// ========================================
// Performance Optimization
// ========================================
// Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Log performance metrics
window.addEventListener('load', () => {
  setTimeout(() => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`🚀 Page loaded in ${pageLoadTime}ms`);
  }, 0);
});
