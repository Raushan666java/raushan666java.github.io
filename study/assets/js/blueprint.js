(function() {
  'use strict';

  var STORAGE_KEY = 'aej:progress:v1';
  var root = document.documentElement;

  // === THEME TOGGLE ===
  // Sync with Material's palette system on load
  var scheme = document.body.getAttribute('data-md-color-scheme') || 'default';
  var storedTheme = localStorage.getItem('theme');
  var initialTheme = storedTheme || (scheme === 'slate' || scheme === 'dark' ? 'dark' : 'light');
  root.setAttribute('data-theme', initialTheme);

  // Listen for theme toggle from MkDocs palette
  document.addEventListener('DOMContentLoaded', function() {
    var paletteToggles = document.querySelectorAll('[data-md-color-scheme]');
    for (var i = 0; i < paletteToggles.length; i++) {
      paletteToggles[i].addEventListener('click', function() {
        var currentScheme = document.body.getAttribute('data-md-color-scheme') || 'default';
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
      var cur = s.current();
      var fire = cur >= 30 ? '🔥🔥🔥' : cur >= 21 ? '🔥🔥' : cur >= 14 ? '🔥' : cur >= 7 ? '💪' : cur >= 3 ? '👏' : '';
      var celebration = '';
      if (cur === 3) celebration = '<div class="streak-celebrate">3 days! Habit building start 🚀</div>';
      else if (cur === 5) celebration = '<div class="streak-celebrate">5 days! Full week 🔥</div>';
      else if (cur === 7) celebration = '<div class="streak-celebrate">1 week consistent! ⭐</div>';
      else if (cur === 10) celebration = '<div class="streak-celebrate">Double digits! Legend status loading 🏆</div>';
      else if (cur === 14) celebration = '<div class="streak-celebrate">2 weeks! You are a machine 🤖</div>';
      else if (cur === 21) celebration = '<div class="streak-celebrate">21 days — habit locked! 🧠</div>';
      else if (cur >= 30) celebration = '<div class="streak-celebrate">' + cur + ' days! Placement hunter mode 🎯</div>';
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
      el.innerHTML = '<div class="streak-row"><span class="streak-count">' + cur + ' day streak ' + fire + '</span></div>'
        + celebration
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

  // === DAILY BANNER - GREETING + QUOTE + TIP ===
  var greetings = [
    "Aaja serious ho jaate hain!",
    "Focus mode ON. Duniya baad mein.",
    "Ek aur din, ek aur chance apne aap ko prove karne ka.",
    "Placement tera wait kar rahi hai. Padh le bhai.",
    "Aaj ka target: 2 topics, 5 problems, 0 distractions.",
    "Jo aaj nahi karega, woh kal pachtayega. Start karo!",
    "Consistency > Intensity. Bas aaj bhi kar liya.",
    "Hard work beats talent when talent doesn't work hard.",
    "Tera competition sirf TU hai — kal se better aaj.",
    "Aaj kuch aisa padho ki interview mein confidence aaye!"
  ];
  var quotes = [
    "Duniya mein sabse powerful cheez hai — ek disciplined mind.",
    "Padhne se fark padta hai. Har topic tumhe ek kadam aage le jaata hai.",
    "Tum apni life ke CEO ho. Aaj ka decision tumhara future decide karega.",
    "Placement ka dar mat, placement ki taiyari ka dar dikhao — karo toh kaun rok sakta hai?",
    "Jo log consistent rehte hain, unhe koi nahi hara sakta.",
    "Success overnight nahi aati. Har roz ki mehnat ka result hoti hai.",
    "Kal soch rahe the? Aaj kar lo. Time wait nahi karta.",
    "Tumhara competition tumse door nahi — tumse aage hai. Pakdo!"
  ];
  var tips = [
    "Complex topic ko chhote parts mein tod do — 25 min focus, 5 min break",
    "Koi bhi problem 20 min se zyada mat uljho. Hint dekho, seekho, aage badho.",
    "Padhai se pehle 2 min deep breathing — focus 2x ho jaayega",
    "Learning technique: Padho → Khud se explain karo → Likho → Repeat",
    "Har din ka 1 problem LinkedIn pe post karo — consistency ka habit banega",
    "Padhte samay phone ko door rakkho — out of sight, out of mind",
    "Sleep is underrated. 7-8 hrs sleep = better retention + clarity",
    "Active recall: Chapter padhne ke baad 5 min band aankh yaad karo",
  ];

  function getDayIndex() {
    return new Date().getDay(); // 0=Sun, 1=Mon, ...
  }

  function updateBanner() {
    var greetingEl = document.getElementById('banner-greeting');
    var quoteEl = document.getElementById('banner-quote');
    var tipEl = document.getElementById('daily-tip');
    if (!greetingEl || !quoteEl || !tipEl) return;

    var dayIdx = getDayIndex();
    var dayOfMonth = new Date().getDate();
    greetingEl.textContent = greetings[dayIdx % greetings.length];
    quoteEl.textContent = '"' + quotes[(dayIdx + dayOfMonth) % quotes.length] + '"';
    tipEl.textContent = tips[(dayIdx + dayOfMonth) % tips.length];
  }

  document.addEventListener('DOMContentLoaded', function() {
    updateBanner();
    setInterval(updateBanner, 3600000);
  });
})();
