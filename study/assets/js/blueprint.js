(function() {
  'use strict';

  var STORAGE_KEY = 'aej:progress:v1';
  var root = document.documentElement;

  // === THEME TOGGLE ===
  var storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    root.setAttribute('data-theme', storedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.setAttribute('data-theme', 'light');
  }

  // Listen for theme toggle from MkDocs palette
  document.addEventListener('DOMContentLoaded', function() {
    var paletteToggles = document.querySelectorAll('[data-md-color-scheme]');
    for (var i = 0; i < paletteToggles.length; i++) {
      paletteToggles[i].addEventListener('click', function() {
        var currentScheme = root.getAttribute('data-md-color-scheme') || 'default';
        var nextTheme = currentScheme === 'default' || currentScheme === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
      });
    }
  });

  // === PROGRESS TRACKING ===
  // Simple localStorage-based completion tracker for lessons

  var progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    lessons: {},
    updatedAt: null
  };

  function save() {
    progress.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    notify();
  }

  var listeners = [];
  function notify() {
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](progress);
    }
  }

  window.AEJProgress = {
    markComplete: function(path) {
      progress.lessons[path] = { completedAt: new Date().toISOString() };
      save();
    },
    unmarkComplete: function(path) {
      delete progress.lessons[path];
      save();
    },
    isComplete: function(path) {
      return !!progress.lessons[path];
    },
    totalCompleted: function() {
      return Object.keys(progress.lessons).length;
    },
    getAll: function() {
      return JSON.parse(JSON.stringify(progress));
    },
    reset: function() {
      progress = { lessons: {}, updatedAt: null };
      save();
    },
    onChange: function(fn) {
      listeners.push(fn);
    }
  };

  // === INTERACTIVE CHECKLISTS ===
  // Wires markdown tasklist checkboxes to localStorage via AEJProgress
  document.addEventListener('DOMContentLoaded', function() {
    // skip DSA tracker page — it manages its own checklists
    if (window.location.pathname.indexOf('dsa-tracker') !== -1) { return; }
    var checkboxes = document.querySelectorAll('.task-list-item input[type="checkbox"]');
    var pageKey = window.location.pathname.replace(/\/+$/, '') || '/';

    for (var i = 0; i < checkboxes.length; i++) {
      var cb = checkboxes[i];
      var label = cb.parentElement.textContent.trim().substring(0, 80);
      var itemKey = pageKey + '::' + label;

      cb.setAttribute('data-aej-key', itemKey);

      if (window.AEJProgress.isComplete(itemKey)) {
        cb.checked = true;
      }

      cb.addEventListener('change', function() {
        var key = this.getAttribute('data-aej-key');
        if (this.checked) {
          window.AEJProgress.markComplete(key);
        } else {
          window.AEJProgress.unmarkComplete(key);
        }
        updateChecklistCounter();
      });
    }

    function updateChecklistCounter() {
      var total = checkboxes.length;
      var done = 0;
      for (var i = 0; i < total; i++) {
        if (checkboxes[i].checked) done++;
      }
      var el = document.querySelector('.checklist-counter');
      if (el) {
        el.textContent = done + ' / ' + total + ' done';
      }
      var pct = total > 0 ? Math.round(done / total * 100) : 0;
      var bar = document.querySelector('.checklist-bar-fill');
      if (bar) { bar.style.width = pct + '%'; }
    }

    var counter = document.querySelector('.checklist-counter');
    if (!counter && checkboxes.length > 0) {
      var container = checkboxes[0].closest('.md-typeset') || document.querySelector('.md-content__inner');
      if (container) {
        var div = document.createElement('div');
        div.className = 'checklist-tracker';
        div.innerHTML = '<span class="checklist-counter"></span><div class="progress-bar checklist-bar"><div class="progress-bar-fill checklist-bar-fill"></div></div>';
        var firstList = container.querySelector('.task-list');
        if (firstList) {
          container.insertBefore(div, firstList.parentElement || firstList);
        }
      }
    }
    updateChecklistCounter();
  });

  // === STREAK TRACKING ===
  (function() {
    var streakKey = 'aej:streak:v1';
    var data = JSON.parse(localStorage.getItem(streakKey)) || { days: {}, last: null };
    var today = new Date().toISOString().slice(0, 10);
    if (data.days[today] !== true) {
      data.days[today] = true;
      data.last = today;
      localStorage.setItem(streakKey, JSON.stringify(data));
    }
    // returns consecutive days ending at today
    function calcStreak(obj) {
      var d = new Date();
      var count = 0;
      for (var i = 0; i < 365; i++) {
        var key = d.toISOString().slice(0, 10);
        if (obj.days[key]) { count++; }
        else if (i > 0) { break; } // gap before today doesn't break streak
        d.setDate(d.getDate() - 1);
      }
      return count;
    }
    window.AEJStreak = {
      current: function() { return calcStreak(data); },
      totalDays: function() { return Object.keys(data.days).length; },
      todayKey: today,
      data: data
    };
  })();

  // === AUTO TODAY'S PLAN (day-of-week based) ===
  (function() {
    var plans = {
      1: { area: 'DSA (Arrays, Strings, Linked Lists)', icon: '▣', tip: 'Solve 1 easy + 1 medium problem' },
      2: { area: 'DSA (Trees, Graphs, DP)', icon: '▣', tip: 'Focus on one pattern — BFS/DFS/recursion' },
      3: { area: 'OS + DBMS', icon: '◆', tip: 'Pick 3 topics, make 1-pager notes' },
      4: { area: 'OS + DBMS', icon: '◆', tip: 'Solve 5 interview questions from each' },
      5: { area: 'CN + COA', icon: '◈', tip: 'Draw diagrams for each protocol/algorithm' },
      6: { area: 'Programming + Project', icon: '⚙', tip: 'Build one small feature or fix a bug' },
      0: { area: 'System Design + Revision', icon: '◉', tip: 'Design 1 system + revise weak topics' }
    };
    var day = new Date().getDay(); // 0=Sun
    var plan = plans[day] || plans[0];
    // write to DOM if container exists
    var el = document.getElementById('today-plan');
    if (el) {
      el.innerHTML = '<span class="plan-icon">' + plan.icon + '</span>'
        + '<span class="plan-area">' + plan.area + '</span>'
        + '<span class="plan-tip">' + plan.tip + '</span>';
    }
  })();

  // === STREAK DISPLAY ===
  (function() {
    var el = document.getElementById('streak-display');
    if (el) {
      var s = window.AEJStreak;
      var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      var now = new Date();
      var weekHtml = '';
      for (var i = 6; i >= 0; i--) {
        var d = new Date(now);
        d.setDate(d.getDate() - i);
        var key = d.toISOString().slice(0, 10);
        var cls = s.data.days[key] ? 'streak-day done' : 'streak-day';
        weekHtml += '<span class="' + cls + '">' + days[d.getDay()][0] + '</span>';
      }
      el.innerHTML = '<div class="streak-row"><span class="streak-count">' + s.current() + ' day streak</span></div>'
        + '<div class="streak-week">' + weekHtml + '</div>';
    }
  })();

  // === TODAY'S COMPLETED COUNT ===
  (function() {
    var el = document.getElementById('today-completed');
    if (el) {
      var total = window.AEJProgress.totalCompleted();
      el.textContent = total + ' items done';
    }
  })();

  // === MODULE NAVIGATION (prev/next) ===
  (function() {
    var nav = {
      'placement/index.md': { prev: null, next: '01-meta-skills/', label: 'Placement Overview' },
      'placement/01-meta-skills/': { prev: 'index.md', next: '02-cs-core/', label: 'Meta Skills' },
      'placement/02-cs-core/': { prev: '01-meta-skills/', next: '03-programming/', label: 'CS Core' },
      'placement/03-programming/': { prev: '02-cs-core/', next: '04-web-dev/', label: 'Programming' },
      'placement/04-web-dev/': { prev: '03-programming/', next: '05-ai-ml/', label: 'Web Dev' },
      'placement/05-ai-ml/': { prev: '04-web-dev/', next: '06-devops/', label: 'AI & ML' },
      'placement/06-devops/': { prev: '05-ai-ml/', next: '07-projects/', label: 'DevOps' },
      'placement/07-projects/': { prev: '06-devops/', next: '08-interview-prep/', label: 'Projects' },
      'placement/08-interview-prep/': { prev: '07-projects/', next: '09-resources/', label: 'Interview Prep' },
      'placement/09-resources/': { prev: '08-interview-prep/', next: '10-system-design/', label: 'Resources' },
      'placement/10-system-design/': { prev: '09-resources/', next: null, label: 'System Design' }
    };
    var path = window.location.pathname.replace(/\/site\//, '/').replace(/\/+$/, '') + '/';
    // try matching
    var key = null;
    for (var k in nav) {
      if (path.indexOf(k) !== -1 || path.indexOf(k.replace('placement/', '')) !== -1) {
        key = k; break;
      }
    }
    if (!key) {
      // also try bare path
      var bare = path.replace(/\/docs\//, '/');
      for (var k in nav) {
        if (bare.indexOf(k) !== -1 || bare.indexOf(k.replace('placement/', '')) !== -1) {
          key = k; break;
        }
      }
    }
    if (key && nav[key]) {
      var container = document.querySelector('.md-content__inner');
      if (container) {
        var navDiv = document.createElement('div');
        navDiv.className = 'module-nav';
        var prev = nav[key].prev;
        var next = nav[key].next;
        var label = nav[key].label;
        var prevHtml = prev ? '<a href="../' + prev + '" class="module-nav-link prev">← ' + (nav[Object.keys(nav).find(function(k) { return k.indexOf(prev) !== -1; })] || {}).label || 'Previous' + '</a>' : '<span></span>';
        var nextHtml = next ? '<a href="../' + next + '" class="module-nav-link next">' + (nav[Object.keys(nav).find(function(k) { return k.indexOf(next) !== -1; })] || {}).label || 'Next' + ' →</a>' : '<span></span>';
        // simpler approach: just use direct mapping
        var prevLabels = { 'placement/index.md': 'Overview', 'placement/01-meta-skills/': 'Meta Skills', 'placement/02-cs-core/': 'CS Core', 'placement/03-programming/': 'Programming', 'placement/04-web-dev/': 'Web Dev', 'placement/05-ai-ml/': 'AI & ML', 'placement/06-devops/': 'DevOps', 'placement/07-projects/': 'Projects', 'placement/08-interview-prep/': 'Interview Prep', 'placement/09-resources/': 'Resources', 'placement/10-system-design/': 'System Design' };
        var prevKey = prev ? Object.keys(prevLabels).find(function(k) { return k.indexOf(prev.replace('../', '')) !== -1; }) : null;
        var nextKey = next ? Object.keys(prevLabels).find(function(k) { return k.indexOf(next.replace('../', '')) !== -1; }) : null;
        var pHtml = prev && prevKey ? '<a href="../' + prev + '" class="module-nav-link prev">← ' + prevLabels[prevKey] + '</a>' : '<span></span>';
        var nHtml = next && nextKey ? '<a href="../' + next + '" class="module-nav-link next">' + prevLabels[nextKey] + ' →</a>' : '<span></span>';
        navDiv.innerHTML = pHtml + nHtml;
        container.appendChild(navDiv);
      }
    }
  })();

  // === PER-PAGE NOTES ===
  (function() {
    var key = 'aej:notes:v1';
    var data = JSON.parse(localStorage.getItem(key)) || {};
    var pagePath = window.location.pathname.replace(/\/+$/, '') || '/';
    var noteEl = document.getElementById('page-notes');
    if (noteEl) {
      var ta = document.createElement('textarea');
      ta.className = 'page-notes-textarea';
      ta.placeholder = 'Write your notes for this page... (auto-saved)';
      ta.value = data[pagePath] || '';
      ta.addEventListener('input', function() {
        data[pagePath] = this.value;
        localStorage.setItem(key, JSON.stringify(data));
      });
      noteEl.appendChild(ta);
    }
  })();

  // === 90-DAY PLAN AUTO-HIGHLIGHT (days elapsed) ===
  (function() {
    var el = document.getElementById('plan-highlight');
    if (!el) return;
    // find current day row
    // goal page has tables with Day | Topic | Problems | Status
    // We calculate days from a start date stored in localStorage or use data-start attribute
    var startDate = el.getAttribute('data-start');
    if (!startDate) {
      // try localStorage
      startDate = localStorage.getItem('aej:plan:start') || '2026-06-01';
    }
    var start = new Date(startDate);
    var now = new Date();
    var elapsed = Math.floor((now - start) / (1000*60*60*24)) + 1;
    if (elapsed < 1) elapsed = 1;
    if (elapsed > 90) elapsed = 90;
    // highlight the table row if we can find it
    var tables = document.querySelectorAll('.md-typeset table');
    for (var t = 0; t < tables.length; t++) {
      var rows = tables[t].querySelectorAll('tbody tr');
      for (var r = 0; r < rows.length; r++) {
        var firstTd = rows[r].querySelector('td');
        if (!firstTd) continue;
        var text = firstTd.textContent.trim();
        // match "Day X" patterns
        var match = text.match(/Day\s*(\d+)/i);
        if (match) {
          var dayNum = parseInt(match[1], 10);
          if (dayNum === elapsed) {
            rows[r].className = 'today-highlight';
            rows[r].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
  })();

  // === OBSERVER FOR STAT BAR ANIMATIONS ===
  document.addEventListener('DOMContentLoaded', function() {
    var statBars = document.querySelectorAll('.stat-row-bar');
    var observer = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var el = entries[i].target;
          var target = el.getAttribute('data-bar-pct');
          if (target !== null) {
            el.style.setProperty('--bar-pct', target + '%');
          }
          observer.unobserve(el);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    for (var i = 0; i < statBars.length; i++) {
      observer.observe(statBars[i]);
    }
  });
})();
