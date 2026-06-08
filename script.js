(function(){
  'use strict';

  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll('.section, .hero');

  navLinks.forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function(link) {
          link.style.color = link.getAttribute('href') === '#' + id
            ? 'var(--accent)' : '';
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(function(s) { observer.observe(s); });

  var cards = document.querySelectorAll('.skill-card, .study-card, .contact-card, .work-item, .about-stat');
  var cardObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(function(c) {
    c.style.opacity = '0';
    c.style.transform = 'translateY(12px)';
    c.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    cardObserver.observe(c);
  });
})();
