(function() {
  'use strict';

  // === NOISE OVERLAY ON REFRESH ===
  // Shows a CRT static / scanline effect for 300ms after page load

  var overlay = document.createElement('div');
  overlay.id = 'noise-overlay';
  overlay.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 100%',
    'height: 100%',
    'pointer-events: none',
    'z-index: 9999',
    'opacity: 0',
    'transition: opacity 0.15s ease'
  ].join(';');

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);

  var ctx = canvas.getContext('2d');

  function generateNoise(ctx, w, h) {
    var imageData = ctx.createImageData(w, h);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      var val = Math.random() * 255;
      data[i] = val;
      data[i+1] = val;
      data[i+2] = val;
      data[i+3] = 180;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Show noise immediately
  overlay.style.opacity = '1';
  generateNoise(ctx, canvas.width, canvas.height);

  // Animate noise for ~300ms
  var start = performance.now();
  function animateNoise(now) {
    var elapsed = now - start;
    if (elapsed < 300) {
      generateNoise(ctx, canvas.width, canvas.height);
      requestAnimationFrame(animateNoise);
    } else {
      // Fade out
      overlay.style.opacity = '0';
      setTimeout(function() {
        overlay.style.display = 'none';
      }, 300);
    }
  }
  requestAnimationFrame(animateNoise);

  // Resize handler
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
})();
