(function() {
  'use strict';

  var FOCUS_MIN = 25;
  var BREAK_MIN = 5;
  var STATE_KEY = 'aej:timer:v1';

  var timerEl = document.getElementById('study-timer');
  if (!timerEl) return;

  var modeEl = document.getElementById('timer-mode');
  var minsEl = document.getElementById('timer-mins');
  var secsEl = document.getElementById('timer-secs');
  var startBtn = document.getElementById('timer-start');
  var resetBtn = document.getElementById('timer-reset');
  var ringEl = document.getElementById('timer-ring');

  var state = JSON.parse(localStorage.getItem(STATE_KEY)) || {
    mode: 'focus',
    remaining: FOCUS_MIN * 60,
    isRunning: false,
    startedAt: null,
    completedSessions: 0
  };

  var interval = null;
  var TOTAL_TIME = state.mode === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60;

  function formatTime(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return { mins: String(m).padStart(2, '0'), secs: String(s).padStart(2, '0') };
  }

  function render() {
    var f = formatTime(Math.max(0, Math.round(state.remaining)));
    minsEl.textContent = f.mins;
    secsEl.textContent = f.secs;
    modeEl.textContent = state.mode === 'focus' ? 'FOCUS' : 'BREAK';

    var pct = TOTAL_TIME > 0 ? ((TOTAL_TIME - state.remaining) / TOTAL_TIME * 100) : 0;
    if (ringEl) ringEl.style.setProperty('--pct', Math.min(100, pct));

    if (state.isRunning) {
      startBtn.textContent = 'PAUSE';
    } else {
      startBtn.textContent = state.remaining <= 0 ? 'RESTART' : 'START';
    }

    var sessionsEl = document.getElementById('timer-sessions');
    if (sessionsEl) sessionsEl.textContent = state.completedSessions;
  }

  function save() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function tick() {
    if (!state.isRunning) return;
    state.remaining -= 1;
    if (state.remaining <= 0) {
      state.remaining = 0;
      state.isRunning = false;
      clearInterval(interval);
      interval = null;
      playNotification();
      if (state.mode === 'focus') {
        state.completedSessions++;
      }
      state.mode = state.mode === 'focus' ? 'break' : 'focus';
      TOTAL_TIME = state.mode === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60;
      state.remaining = TOTAL_TIME;
      state.startedAt = null;
      save();
      render();
      return;
    }
    save();
    render();
  }

  function playNotification() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(function() {
        var osc2 = ctx.createOscillator();
        var gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        osc2.type = 'sine';
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      }, 400);
    } catch(e) {}
  }

  function toggleTimer() {
    if (state.remaining <= 0) {
      state.mode = 'focus';
      TOTAL_TIME = FOCUS_MIN * 60;
      state.remaining = TOTAL_TIME;
      state.startedAt = null;
      state.isRunning = false;
      if (interval) { clearInterval(interval); interval = null; }
      save();
      render();
      return;
    }
    state.isRunning = !state.isRunning;
    if (state.isRunning) {
      if (!state.startedAt) state.startedAt = Date.now();
      interval = setInterval(tick, 1000);
    } else {
      if (interval) { clearInterval(interval); interval = null; }
    }
    save();
    render();
  }

  function resetTimer() {
    state.isRunning = false;
    if (interval) { clearInterval(interval); interval = null; }
    state.mode = 'focus';
    TOTAL_TIME = FOCUS_MIN * 60;
    state.remaining = TOTAL_TIME;
    state.startedAt = null;
    save();
    render();
  }

  render();
  if (state.isRunning) {
    interval = setInterval(tick, 1000);
  }

  startBtn.addEventListener('click', toggleTimer);
  resetBtn.addEventListener('click', resetTimer);

  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && state.isRunning && state.startedAt) {
      var elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      state.remaining = Math.max(0, TOTAL_TIME - elapsed);
      if (state.remaining <= 0) {
        state.isRunning = false;
        clearInterval(interval);
        interval = null;
        playNotification();
        state.completedSessions++;
        state.mode = 'focus';
        TOTAL_TIME = FOCUS_MIN * 60;
        state.remaining = TOTAL_TIME;
        state.startedAt = null;
      }
      save();
      render();
    }
  });
})();
