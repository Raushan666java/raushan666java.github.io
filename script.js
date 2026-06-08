(function(){
  'use strict';

  // === SMOOTH SCROLL FOR NAV ===
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // === ACTIVE NAV HIGHLIGHT ===
  var sections = document.querySelectorAll('.section, .hero');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function(link) {
          link.style.color = link.getAttribute('href') === '#' + id
            ? 'var(--blueprint)' : '';
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(function(s) { observer.observe(s); });
})();
