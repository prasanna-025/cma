/* ========================================
   PlacementOS — app.js
======================================== */

// ── STATE ──
const S = {
  dsa: [], projects: [], applications: [],
  hours: {}, dailyChecks: {}, placementChecks: {},
  skills: {}, subjects: {}, customSkills: [],
  streak: 0, lastActive: null,
  xp: 0, level: 1,
  mocks: 0, apps: 0,
  weekHours: {},
  roadmapChecks: {},
  roadmapNotes: {},
  roadmapLinks: {}
};

// ── LOAD ──
function load() {
  const saved = localStorage.getItem('placementOS_v2');
  if (saved) Object.assign(S, JSON.parse(saved));
  if (!S.customSkills) S.customSkills = [];
  if (!S.speakingPracticeMins) S.speakingPracticeMins = 0;
  if (!S.speakingPracticeLog) S.speakingPracticeLog = [];
  if (!S.vocabulary) S.vocabulary = [];
  if (!S.roadmapChecks) S.roadmapChecks = {};
  if (!S.roadmapNotes) S.roadmapNotes = {};
  if (!S.roadmapLinks) S.roadmapLinks = {};
  initStreakCheck();
}

function save() {
  S.updatedAt = Date.now();
  localStorage.setItem('placementOS_v2', JSON.stringify(S));
  if (typeof window.syncPush === 'function') {
    window.syncPush(S);
  }
}

// ── SUBJECTS DATA ──
const SUBJECTS_DATA = {
  DBMS: ['ER Diagrams', 'Normalization (1NF-3NF)', 'SQL Queries', 'Transactions & ACID', 'Indexing & B-Trees', 'Joins & Aggregations', 'NoSQL Basics', 'Query Optimization'],
  'Operating Systems': ['Process Management', 'Threads & Concurrency', 'CPU Scheduling', 'Memory Management', 'Paging & Segmentation', 'Deadlocks', 'File Systems', 'Semaphores & Mutex'],
  'Computer Networks': ['OSI Model', 'TCP/IP', 'HTTP/HTTPS', 'DNS & DHCP', 'Routing Algorithms', 'Subnetting', 'Sockets', 'Network Security'],
  OOP: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Abstraction', 'Encapsulation', 'SOLID Principles', 'Design Patterns', 'Interfaces vs Abstract']
};

const COMM_SKILLS = ['Reading Comprehension', 'Speaking Fluency', 'Vocabulary Building', 'Email Writing', 'Interview Answers', 'Group Discussion', 'Presentation Skills'];
const SOFT_SKILLS = ['Confidence', 'Presentation', 'Leadership', 'Teamwork', 'Time Management', 'Problem Solving', 'Adaptability', 'Critical Thinking'];
const QUANT_APTITUDE = [
  'Divisibility',
  'Decimal Fractions and Numbers',
  'Number System and LCM & HCF',
  'Mensuration',
  'Geometry',
  'Area, Perimeter, and Shapes',
  'Ages (Arithmetic Ability)',
  'Averages (Arithmetic Ability)',
  'Equations (Arithmetic Ability)',
  'Probability (Arithmetic Ability)',
  'Percentages (Arithmetic Ability)',
  'Profit and Loss (Arithmetic Ability)',
  'Time and Work (Arithmetic Ability)',
  'Clocks and Calendar',
  'Arrangement & Series',
  'Ratios and Proportions',
  'Series and Progressions',
  'Allegations and Mixtures',
  'Distance, Speed, and Time',
  'Permutations and Combinations',
  'Elementary Statistics'
];
const LOGICAL_REASONING = [
  'Meaningful Word Creation',
  'Number Series',
  'Missing Number Single',
  'Missing Number Analogy',
  'Blood Relations',
  'Coding-Decoding',
  'Ages (Rank Based Logic)',
  'Data Sufficiency',
  'Rank Based Logic',
  'Seating Arrangement (Complex)',
  'Odd Man Out (Numbers)',
  'Odd Man Out (Logical)',
  'Distance and Directions',
  'Statement and Conclusion',
  'Mathematical Operational Arrangement',
  'Symbols and Notations'
];
const VERBAL_ABILITY = [
  'Spelling',
  'Grammar',
  'Selecting words',
  'Error Correction',
  'Passage Ordering',
  'Error Identification',
  'Sentence Completion',
  'Synonyms and Antonyms',
  'Reading Comprehension (Verbal)',
  'Cloze Test',
  'Reading and Comprehension'
];

let activeSoftSkillsTab = 'core'; // 'core', 'quant', 'logical', 'verbal'

const DSA_CATS = ['Arrays', 'Strings', 'Trees', 'Graphs', 'DP', 'Sorting', 'Linked List', 'Binary Search', 'Stack/Queue', 'Greedy'];
const DASH_QUOTES = [
  { q: "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.", a: "Samuel Beckett" },
  { q: "Never give up. Today is hard, tomorrow will be worse, but the day after tomorrow will be sunshine.", a: "Jack Ma" },
  { q: "The only way to do great work is to love what you do. And if you don't love it yet, code until you do.", a: "Steve Jobs (adapted)" },
  { q: "An investment in yourself pays the best interest. Every hour studying DSA is compounding.", a: "Benjamin Franklin (adapted)" },
  { q: "First, solve the problem. Then, write the code.", a: "John Johnson" },
  { q: "Success is the sum of small efforts, repeated day in and day out. One problem at a time.", a: "Robert Collier" }
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TODAY_KEY = new Date().toISOString().slice(0, 10);

const BADGES = [
  { id: 'first_problem', icon: '🎯', label: 'First Blood', desc: 'Solved first problem', check: () => S.dsa.length >= 1 },
  { id: 'ten_problems', icon: '💪', label: 'Grinder', desc: '10 problems solved', check: () => S.dsa.length >= 10 },
  { id: 'fifty_problems', icon: '🔥', label: 'On Fire', desc: '50 problems solved', check: () => S.dsa.length >= 50 },
  { id: 'streak3', icon: '⚡', label: '3-Day Streak', desc: '3 days active', check: () => S.streak >= 3 },
  { id: 'streak7', icon: '🌟', label: 'Week Warrior', desc: '7-day streak', check: () => S.streak >= 7 },
  { id: 'hours10', icon: '⏱️', label: 'Focused', desc: '10 total hours', check: () => totalHours() >= 10 },
  { id: 'hours50', icon: '🏆', label: 'Dedicated', desc: '50 total hours', check: () => totalHours() >= 50 },
  { id: 'project1', icon: '🚀', label: 'Builder', desc: 'Added first project', check: () => S.projects.length >= 1 },
  { id: 'mock5', icon: '🎤', label: 'Mock Star', desc: '5 mock interviews', check: () => S.mocks >= 5 },
  { id: 'all_subjects', icon: '📚', label: 'Scholar', desc: 'All subjects > 50%', check: () => Object.keys(SUBJECTS_DATA).every(k => subjectPct(k) >= 50) },
];

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  load();
  injectSVGDefs();
  setupNav();
  setupMobileMenu();
  setDateChip();
  renderAll();
  initDashQuoteRotator();
  loadStopwatchState();
});

function renderAll() {
  renderDashboard();
  renderDSASection();
  renderSubjects();
  renderCommSkills();
  renderSoftSkills();
  renderProjects();
  renderPlacement();
  renderCustomSkills();
  renderAnalytics();
  renderRoadmap();
}

function injectSVGDefs() {
  document.body.insertAdjacentHTML('beforeend', `
    <svg class="svg-defs" aria-hidden="true">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#6c63ff"/>
          <stop offset="100%" style="stop-color:#00d4aa"/>
        </linearGradient>
      </defs>
    </svg>
  `);
}

// ── NAV ──
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const sec = item.dataset.section;
      switchSection(sec);
      if (window.innerWidth < 900) closeSidebar();
    });
  });
}

function switchSection(sec) {
  // Handle DSA Tracker - navigate to external page
  if (sec === 'dsa') {
    window.location.href = 'dsa-problems.html';
    return;
  }
  
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelector(`.nav-item[data-section="${sec}"]`)?.classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${sec}`)?.classList.add('active');
  const titles = { dashboard: 'Dashboard', dsa: 'DSA Tracker', subjects: 'Core Subjects', communication: 'Communication', softskills: 'Soft Skills', projects: 'Projects', placement: 'Placement Tracker', roadmap: '8-Month Roadmap', extraskills: 'Cloud & Extra Skills', analytics: 'Analytics' };
  document.getElementById('topbar-title').textContent = titles[sec] || sec;
  if (sec === 'analytics') renderAnalytics();
  if (sec === 'extraskills') renderCustomSkills();
  if (sec === 'roadmap') renderRoadmap();
}

function setupMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  let overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', closeSidebar);
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('show');
}

function setDateChip() {
  const d = new Date();
  document.getElementById('date-chip').textContent = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── STREAK ──
function initStreakCheck() {
  const today = TODAY_KEY;
  if (!S.lastActive) { S.lastActive = today; S.streak = 1; save(); return; }
  const diff = daysBetween(S.lastActive, today);
  if (diff === 0) return;
  if (diff === 1) { S.streak++; }
  else { S.streak = 1; }
  S.dailyChecks = {}; // Reset daily checklist on a new day
  S.lastActive = today;
  save();
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// ── XP ──
function addXP(pts) {
  S.xp += pts;
  S.level = Math.floor(S.xp / 100) + 1;
  updateXPBar();
  save();
}

function updateXPBar() {
  const xpInLevel = S.xp % 100;
  document.getElementById('sb-xp-fill').style.width = xpInLevel + '%';
  document.getElementById('sb-level').textContent = S.level;
  document.getElementById('sb-xp').textContent = S.xp + ' XP';
}

// ── DASHBOARD ──
function renderDashboard() {
  // Dynamic Greeting
  const hr = new Date().getHours();
  let greet = "Good morning, Coder 👋";
  if (hr >= 12 && hr < 17) greet = "Good afternoon, Coder ⚡";
  else if (hr >= 17 && hr < 22) greet = "Good evening, Coder 🌌";
  else if (hr >= 22 || hr < 5) greet = "Burning the midnight oil, Coder 🦉";
  
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) greetingEl.textContent = greet;

  // Readiness
  const pct = calcReadiness();
  document.getElementById('readiness-pct').textContent = pct + '%';
  document.getElementById('r-dsa').textContent = S.dsa.length;
  document.getElementById('r-hours').textContent = totalHours() + 'h';
  document.getElementById('r-streak').textContent = S.streak;
  document.getElementById('r-xp').textContent = S.xp;
  document.getElementById('top-streak').textContent = S.streak;

  const ring = document.getElementById('readiness-ring');
  const circ = 326.7;
  if (ring) ring.style.strokeDashoffset = circ - (pct / 100 * circ);

  // Hours
  const todayH = S.hours[TODAY_KEY] || 0;
  const weekH = getWeekHours();
  document.getElementById('hours-today').textContent = todayH + 'h';
  document.getElementById('hours-week').textContent = weekH + 'h';
  document.getElementById('hours-total').textContent = totalHours() + 'h';

  // Update daily checklist subject label based on rotation
  const dailySubjectSpan = document.querySelector('#daily-checklist input[data-key="daily-subject"] ~ span');
  if (dailySubjectSpan) {
    const subjects = [
      'Revision + Mock (Revise all 3 + Mock)', // Sunday
      'DBMS Topic', // Monday
      'Operating Systems Topic', // Tuesday
      'Computer Networks Topic', // Wednesday
      'DBMS Topic', // Thursday
      'Operating Systems Topic', // Friday
      'Computer Networks Topic' // Saturday
    ];
    const todaySubject = subjects[new Date().getDay()];
    dailySubjectSpan.innerHTML = `Core Subject: <b>${todaySubject}</b>`;
  }

  // Update daily checklist soft skill label based on rotation
  const dailySoftskillSpan = document.querySelector('#daily-checklist input[data-key="daily-softskill"] ~ span');
  if (dailySoftskillSpan) {
    const softskills = [
      'Core Soft Skills Focus', // Sunday
      'Quantitative Aptitude Focus', // Monday
      'Logical Reasoning Focus', // Tuesday
      'Verbal Ability Focus', // Wednesday
      'Quantitative Aptitude Focus', // Thursday
      'Logical Reasoning Focus', // Friday
      'Verbal Ability Focus' // Saturday
    ];
    const todaySoftskill = softskills[new Date().getDay()];
    dailySoftskillSpan.innerHTML = `Soft Skill: <b>${todaySoftskill}</b>`;
  }

  // Daily checklist
  restoreCheckboxes('daily-checklist', S.dailyChecks, 'data-key');
  updateDailyPct();

  // Badges
  renderBadges();

  // Week grid
  renderWeekGrid();

  // Sidebar XP
  updateXPBar();

  // Today's DSA Progress Dashboard Card
  const dsaToday = getTodayDSACount();
  const dsaTodayChip = document.getElementById('dash-dsa-today');
  if (dsaTodayChip) dsaTodayChip.textContent = `${dsaToday} / 5`;
  const dsaFill = document.getElementById('dash-dsa-fill');
  if (dsaFill) dsaFill.style.width = Math.min(100, (dsaToday / 5) * 100) + '%';

  // Render recent DSA problems solved today
  const recentDsaEl = document.getElementById('dash-dsa-recent');
  if (recentDsaEl) {
    const todayProbs = S.dsa.filter(p => p.date === TODAY_KEY);
    if (todayProbs.length === 0) {
      recentDsaEl.innerHTML = `
        <div style="font-size: 11.5px; color: var(--text3); font-style: italic; text-align: center; padding: 12px 0;">
          No problems solved today yet. Let's make a dent!
        </div>
      `;
    } else {
      recentDsaEl.innerHTML = todayProbs.map(p => `
        <div class="problem-item" style="padding: 8px 12px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border);">
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 12.5px; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: #fff;">
              ${p.name}
            </div>
            <div style="font-size: 10px; color: var(--text2); display: flex; gap: 8px; margin-top: 2px;">
              <span>${p.cat}</span>
              <span class="prob-diff-tag ${p.diff}" style="padding: 0px 4px; font-size: 8px;">${p.diff}</span>
            </div>
          </div>
          ${p.link ? `<a href="${p.link}" target="_blank" style="font-size: 11px; color: var(--accent2); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(0, 212, 170, 0.2); padding: 2px 6px; border-radius: 4px;"><i class="fas fa-external-link-alt"></i> Code</a>` : ''}
        </div>
      `).join('');
    }
  }
}

function calcReadiness() {
  let score = 0;
  score += Math.min(30, S.dsa.length * 0.3);            // DSA: max 30
  score += Math.min(20, totalHours() * 0.2);             // Hours: max 20
  score += Math.min(20, subjectsAvgPct() * 0.2);         // Subjects: max 20
  score += Math.min(10, (S.projects.length >= 2 ? 10 : S.projects.length * 5)); // Projects: max 10
  score += Math.min(10, resumeScore() * 10);             // Resume: max 10
  score += Math.min(10, (S.mocks / 10) * 10);            // Mocks: max 10
  return Math.min(100, Math.round(score));
}

function totalHours() {
  return Object.values(S.hours).reduce((a, b) => a + b, 0);
}

function getWeekHours() {
  const now = new Date();
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    total += S.hours[key] || 0;
  }
  return total;
}

function resumeScore() {
  const keys = ['resume-made', 'resume-ats', 'resume-reviewed', 'resume-1page'];
  return keys.filter(k => S.placementChecks[k]).length / keys.length;
}

function subjectsAvgPct() {
  const pcts = Object.keys(SUBJECTS_DATA).map(k => subjectPct(k));
  return pcts.reduce((a, b) => a + b, 0) / pcts.length;
}

function subjectPct(name) {
  if (!S.subjects[name]) return 0;
  const topics = SUBJECTS_DATA[name];
  const done = topics.filter(t => S.subjects[name]?.[t]).length;
  return Math.round(done / topics.length * 100);
}

function updateDailyPct() {
  const keys = ['daily-dsa', 'daily-subject', 'daily-softskill', 'daily-comm', 'daily-project', 'daily-reading'];
  const done = keys.filter(k => S.dailyChecks[k]).length;
  document.getElementById('daily-pct-label').textContent = `${done} / 6 done`;
  document.getElementById('daily-fill').style.width = (done / 6 * 100) + '%';
}

function toggleDaily(cb) {
  S.dailyChecks[cb.dataset.key] = cb.checked;
  if (cb.checked) {
    addXP(5);
    if (window.event) {
      const e = window.event;
      if (e.clientX && e.clientY) {
        spawnConfetti(e.clientX, e.clientY);
      }
    }
  }
  updateDailyPct();
  save();
  renderDashboard();
}

function renderBadges() {
  const grid = document.getElementById('badges-grid');
  grid.innerHTML = BADGES.map(b => `
    <div class="badge ${b.check() ? 'earned' : ''}">
      <span class="badge-icon">${b.icon}</span>
      <span>${b.label}</span>
    </div>
  `).join('');
}

function renderWeekGrid() {
  const grid = document.getElementById('week-grid');
  const now = new Date();
  grid.innerHTML = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hrs = S.hours[key] || 0;
    const isToday = key === TODAY_KEY;
    grid.innerHTML += `
      <div class="week-day">
        <div class="week-day-label">${DAYS[d.getDay()]}</div>
        <div class="week-day-box ${hrs > 0 ? 'has-data' : ''} ${isToday ? 'today' : ''}">
          ${hrs > 0 ? hrs + 'h' : '—'}
        </div>
      </div>
    `;
  }
}

// ── HOURS & TIMER ──
let swInterval = null;
let swRunning = false;

function loadStopwatchState() {
  if (!document.getElementById('pulse-timer-style')) {
    const style = document.createElement('style');
    style.id = 'pulse-timer-style';
    style.textContent = `@keyframes pulse-timer { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`;
    document.head.appendChild(style);
  }

  const start = localStorage.getItem('placementOS_sw_start');
  const accum = parseInt(localStorage.getItem('placementOS_sw_accum') || '0', 10);
  
  if (start) {
    swRunning = true;
    const elapsed = Math.floor((Date.now() - parseInt(start, 10)) / 1000) + accum;
    startStopwatchInterval(elapsed);
    updateStopwatchUI(true);
    switchLoggerTab('timer');
  } else if (accum > 0) {
    swRunning = false;
    updateStopwatchDisplay(accum);
    updateStopwatchUI(false, true);
    switchLoggerTab('timer');
  }
}

function updateStopwatchDisplay(totalSecs) {
  const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
  const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
  const secs = (totalSecs % 60).toString().padStart(2, '0');
  const display = document.getElementById('stopwatch-display');
  if (display) display.textContent = `${hrs}:${mins}:${secs}`;
}

function startStopwatchInterval(initialSecs) {
  let currentSecs = initialSecs;
  updateStopwatchDisplay(currentSecs);
  
  const display = document.getElementById('stopwatch-display');
  if (display) display.style.animation = 'pulse-timer 1.5s infinite';

  swInterval = setInterval(() => {
    currentSecs++;
    updateStopwatchDisplay(currentSecs);
  }, 1000);
}

function toggleStopwatch() {
  const start = localStorage.getItem('placementOS_sw_start');
  const accum = parseInt(localStorage.getItem('placementOS_sw_accum') || '0', 10);

  if (swRunning) {
    // Pause
    clearInterval(swInterval);
    swInterval = null;
    swRunning = false;
    
    if (start) {
      const sessionElapsed = Math.floor((Date.now() - parseInt(start, 10)) / 1000);
      localStorage.setItem('placementOS_sw_accum', (accum + sessionElapsed).toString());
      localStorage.removeItem('placementOS_sw_start');
    }
    
    const display = document.getElementById('stopwatch-display');
    if (display) display.style.animation = 'none';

    updateStopwatchUI(false, true);
  } else {
    // Start/Resume
    swRunning = true;
    localStorage.setItem('placementOS_sw_start', Date.now().toString());
    
    startStopwatchInterval(accum);
    updateStopwatchUI(true);
  }
}

function updateStopwatchUI(isRunning, hasAccumulated = false) {
  const startBtn = document.getElementById('sw-start-btn');
  const stopBtn = document.getElementById('sw-stop-btn');
  if (!startBtn || !stopBtn) return;

  if (isRunning) {
    startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    startBtn.className = 'btn btn-sm';
    startBtn.style.background = 'rgba(247,201,72,.15)';
    startBtn.style.border = '1px solid rgba(247,201,72,.3)';
    startBtn.style.color = 'var(--med)';
    
    stopBtn.disabled = false;
    stopBtn.style.opacity = '1';
    stopBtn.style.cursor = 'pointer';
    stopBtn.className = 'btn btn-primary';
    stopBtn.style.background = 'var(--hard)';
  } else {
    startBtn.innerHTML = hasAccumulated ? '<i class="fas fa-play"></i> Resume' : '<i class="fas fa-play"></i> Start';
    startBtn.className = 'btn btn-primary';
    startBtn.style.background = 'var(--accent)';
    startBtn.style.color = '#fff';
    startBtn.style.border = 'none';
    
    if (hasAccumulated) {
      stopBtn.disabled = false;
      stopBtn.style.opacity = '1';
      stopBtn.style.cursor = 'pointer';
      stopBtn.className = 'btn btn-primary';
      stopBtn.style.background = 'var(--hard)';
    } else {
      stopBtn.disabled = true;
      stopBtn.style.opacity = '0.5';
      stopBtn.style.cursor = 'not-allowed';
      stopBtn.className = 'btn btn-sm';
      stopBtn.style.background = 'var(--bg3)';
      stopBtn.style.color = 'var(--text2)';
    }
  }
}

function stopStopwatch() {
  clearInterval(swInterval);
  swInterval = null;
  
  const start = localStorage.getItem('placementOS_sw_start');
  const accum = parseInt(localStorage.getItem('placementOS_sw_accum') || '0', 10);
  
  let totalSecs = accum;
  if (start) {
    totalSecs += Math.floor((Date.now() - parseInt(start, 10)) / 1000);
  }
  
  localStorage.removeItem('placementOS_sw_start');
  localStorage.removeItem('placementOS_sw_accum');
  
  swRunning = false;
  
  updateStopwatchDisplay(0);
  const display = document.getElementById('stopwatch-display');
  if (display) display.style.animation = 'none';
  updateStopwatchUI(false, false);
  
  const loggedHours = totalSecs / 3600;
  addStudyHours(loggedHours, true);
}

function switchLoggerTab(tab) {
  const tabManual = document.getElementById('tab-manual');
  const tabTimer = document.getElementById('tab-timer');
  const manualForm = document.getElementById('logger-manual-form');
  const timerForm = document.getElementById('logger-timer-form');
  
  if (!tabManual || !tabTimer || !manualForm || !timerForm) return;

  if (tab === 'manual') {
    tabManual.classList.add('active');
    tabManual.style.background = 'rgba(108,99,255,.18)';
    tabManual.style.color = 'var(--accent)';
    
    tabTimer.classList.remove('active');
    tabTimer.style.background = 'transparent';
    tabTimer.style.color = 'var(--text2)';
    
    manualForm.style.display = 'flex';
    timerForm.style.display = 'none';
  } else {
    tabTimer.classList.add('active');
    tabTimer.style.background = 'rgba(108,99,255,.18)';
    tabTimer.style.color = 'var(--accent)';
    
    tabManual.classList.remove('active');
    tabManual.style.background = 'transparent';
    tabManual.style.color = 'var(--text2)';
    
    manualForm.style.display = 'none';
    timerForm.style.display = 'flex';
  }
}

function addStudyHours(hours, isTimer = false) {
  if (hours <= 0) return;
  const roundedHours = Math.round(hours * 100) / 100;
  if (roundedHours <= 0) {
    return toast('Session too short to log (min 1 min)', 'error');
  }
  S.hours[TODAY_KEY] = (S.hours[TODAY_KEY] || 0) + roundedHours;
  addXP(Math.max(1, Math.floor(roundedHours * 10)));
  save();
  renderDashboard();
  if (isTimer) {
    toast(`⏱️ Session logged: ${roundedHours}h! Keep it up!`);
  } else {
    toast(`✅ ${roundedHours}h logged — keep grinding!`);
  }
}

function logHours() {
  const v = parseFloat(document.getElementById('hours-input').value);
  if (!v || v <= 0) return toast('Enter valid hours', 'error');
  document.getElementById('hours-input').value = '';
  addStudyHours(v, false);
}

// ── DSA ──
function addDSAProblem() {
  const name = document.getElementById('prob-name').value.trim();
  const cat = document.getElementById('prob-cat').value;
  const diff = document.getElementById('prob-diff').value;
  const link = document.getElementById('prob-link').value.trim();
  const notes = document.getElementById('prob-notes').value.trim();

  if (!name) { toast('Please enter a problem name.', 'error'); return; }

  const prob = { name, cat, diff, link, notes, date: TODAY_KEY };
  S.dsa.push(prob);
  document.getElementById('prob-name').value = '';
  document.getElementById('prob-link').value = '';
  addXP(prob.diff === 'Easy' ? 10 : prob.diff === 'Medium' ? 20 : 35);
  
  if (window.event) {
    const e = window.event;
    if (e.clientX && e.clientY) {
      spawnConfetti(e.clientX, e.clientY);
    }
  }

  save();
  renderDSASection();
  renderDashboard();
  toast(`🎯 "${name}" added — ${getTodayDSACount()}/5 today!`);
}

function getTodayDSACount() {
  return S.dsa.filter(p => p.date === TODAY_KEY).length;
}

let dsaFilter = 'All';

function filterDSA(chip) {
  dsaFilter = chip.dataset.filter;
  document.querySelectorAll('#dsa-filter-chips .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderProblemList();
}

function renderDSASection() {
  // Daily ring
  const todayCount = getTodayDSACount();
  const ring = document.getElementById('dsa-daily-ring');
  const circ = 201;
  if (ring) ring.style.strokeDashoffset = circ - Math.min(1, todayCount / 5) * circ;
  const todayCountEl = document.getElementById('dsa-today-count');
  if (todayCountEl) todayCountEl.textContent = todayCount;
  const totalDisplayEl = document.getElementById('dsa-total-display');
  if (totalDisplayEl) totalDisplayEl.textContent = S.dsa.length;

  const msgs = [
    'Start strong — solve your first problem!',
    'Great start! Keep going!',
    'Halfway there!',
    'Almost done!',
    'One more for the target!',
    '🔥 Target crushed! Bonus round?'
  ];
  const motivationLineEl = document.getElementById('dsa-motivation-line');
  if (motivationLineEl) motivationLineEl.textContent = msgs[Math.min(todayCount, msgs.length - 1)];

  // Update difficulty counts
  const easyCount = S.dsa.filter(p => p.diff === 'Easy').length;
  const medCount = S.dsa.filter(p => p.diff === 'Medium').length;
  const hardCount = S.dsa.filter(p => p.diff === 'Hard').length;
  
  const easyEl = document.getElementById('dsa-easy-count');
  if (easyEl) easyEl.textContent = easyCount;
  const medEl = document.getElementById('dsa-med-count');
  if (medEl) medEl.textContent = medCount;
  const hardEl = document.getElementById('dsa-hard-count');
  if (hardEl) hardEl.textContent = hardCount;

  // Category bars
  const catBars = document.getElementById('dsa-cat-bars');
  if (catBars) {
    const counts = {};
    DSA_CATS.forEach(c => counts[c] = 0);
    S.dsa.forEach(p => { if (counts[p.cat] !== undefined) counts[p.cat]++; });
    const max = Math.max(...Object.values(counts), 1);
    catBars.innerHTML = DSA_CATS.map(c => `
      <div class="cat-bar-item">
        <div class="cat-bar-label"><span>${c}</span><span>${counts[c]}</span></div>
        <div class="prog-bar"><div class="prog-fill" style="width:${counts[c]/max*100}%"></div></div>
      </div>
    `).join('');
  }

  renderProblemList();
}

function renderProblemList() {
  const list = document.getElementById('problem-list');
  const filtered = dsaFilter === 'All' ? S.dsa : S.dsa.filter(p => p.cat === dsaFilter);
  if (!filtered.length) {
    list.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:20px;text-align:center">No problems yet. Add your first one! 💪</div>`;
    return;
  }
  list.innerHTML = [...filtered].reverse().map(p => `
    <div class="problem-item">
      <span class="prob-cat-tag">${p.cat}</span>
      <span class="prob-name">${p.name}${p.link ? ` <a href="${p.link}" target="_blank" style="color:var(--accent2);font-size:11px;margin-left:4px"><i class="fas fa-external-link-alt"></i></a>` : ''}</span>
      <span class="prob-diff-tag ${p.diff}">${p.diff}</span>
      <span class="prob-date">${p.date}</span>
      <button class="btn-danger" onclick="deleteProblem(${p.id})"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
}

function deleteProblem(id) {
  S.dsa = S.dsa.filter(p => p.id !== id);
  save();
  renderDSASection();
  renderDashboard();
  toast('Problem removed');
}

// ── SUBJECTS ──
// ── SUBJECTS ──
function renderSubjectRotation() {
  const container = document.getElementById('subjects-overview');
  if (!container) return;

  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const schedule = [
    { day: 'Sunday', subject: 'Revision + Mock', desc: 'Revise all three + mock interview', icon: 'fa-graduation-cap' },
    { day: 'Monday', subject: 'DBMS', desc: 'Database Management Systems study slot', icon: 'fa-database' },
    { day: 'Tuesday', subject: 'Operating Systems', desc: 'Process, memory, deadlocks, etc.', icon: 'fa-laptop-code' },
    { day: 'Wednesday', subject: 'Computer Networks', desc: 'OSI model, TCP/IP, protocols, subnetting', icon: 'fa-network-wired' },
    { day: 'Thursday', subject: 'DBMS', desc: 'SQL, transactions, normalization, indexing', icon: 'fa-database' },
    { day: 'Friday', subject: 'Operating Systems', desc: 'OS scheduling, memory, file systems', icon: 'fa-laptop-code' },
    { day: 'Saturday', subject: 'Computer Networks', desc: 'Routing, sockets, networks security', icon: 'fa-network-wired' }
  ];
  
  const todayItem = schedule[dayIndex];
  
  const scheduleHtml = schedule.map((item, idx) => {
    const isToday = idx === dayIndex;
    return `
      <div class="rotation-day-card ${isToday ? 'active' : ''}" style="
        padding: 12px;
        background: ${isToday ? 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,212,170,0.1) 100%)' : 'rgba(255,255,255,0.02)'};
        border: 1px solid ${isToday ? 'var(--accent)' : 'var(--border)'};
        border-radius: var(--radius);
        text-align: center;
        flex: 1;
        min-width: 110px;
        position: relative;
        transition: all 0.25s ease;
        box-shadow: ${isToday ? '0 8px 24px rgba(108,99,255,0.15)' : 'none'};
      ">
        ${isToday ? `<span style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: var(--accent2); color: var(--bg); font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px;">TODAY</span>` : ''}
        <div style="font-size: 11px; font-weight: 700; color: ${isToday ? 'var(--accent2)' : 'var(--text3)'}; margin-bottom: 4px; text-transform: uppercase;">${item.day.slice(0, 3)}</div>
        <div style="font-size: 18px; margin-bottom: 6px; color: ${isToday ? 'var(--text)' : 'var(--text2)'};"><i class="fas ${item.icon}"></i></div>
        <div style="font-size: 11.5px; font-weight: 700; color: var(--text);">${item.subject}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="subject-rotation-container" style="
      margin-bottom: 24px;
      padding: 18px;
      background: var(--bg2);
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    ">
      <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; margin-bottom: 18px;">
        <div style="flex: 1; min-width: 250px;">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-calendar-alt" style="color: var(--accent);"></i> Core Subject Rotation Schedule
          </h3>
          <p style="font-size: 12.5px; color: var(--text2); line-height: 1.5; margin: 0;">
            Revisit every core subject (DBMS, OS, Computer Networks) every single week so concepts stay fresh in your mind for placement interviews!
          </p>
        </div>
        <div class="today-rotation-banner" style="
          background: rgba(108,99,255,0.06);
          border: 1px dashed rgba(108,99,255,0.3);
          padding: 10px 14px;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 240px;
        ">
          <div style="font-size: 22px; color: var(--accent2);"><i class="fas ${todayItem.icon}"></i></div>
          <div>
            <div style="font-size: 10px; color: var(--text3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Today's Rotation Focus</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text);">${todayItem.subject}</div>
            <div style="font-size: 10.5px; color: var(--text2); margin-top: 1px;">${todayItem.desc}</div>
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: space-between;">
        ${scheduleHtml}
      </div>
    </div>
  `;
}

function renderSubjects() {
  renderSubjectRotation();
  
  const grid = document.getElementById('subjects-grid');
  grid.innerHTML = Object.keys(SUBJECTS_DATA).map(sub => {
    if (!S.subjects[sub]) S.subjects[sub] = {};
    const pct = subjectPct(sub);
    return `
      <div class="subject-card">
        <div class="subject-title">
          <span>${sub}</span>
          <span class="subject-pct">${pct}%</span>
        </div>
        <div class="prog-bar" style="margin:8px 0">
          <div class="prog-fill" style="width:${pct}%"></div>
        </div>
        <div class="subject-topics">
          ${SUBJECTS_DATA[sub].map(topic => {
            const isDone = !!S.subjects[sub]?.[topic];
            const chatLink = S.subjects[sub]?.[topic + '_chat_link'] || '';
            return `
              <div class="topic-item-wrapper" style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:4px 6px; border-radius:7px; transition:background .15s;">
                <label class="topic-item" style="flex:1; padding:0; margin:0; cursor:pointer;">
                  <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleTopic('${sub}','${topic}',this)">
                  <span style="${isDone ? 'text-decoration:line-through; color:var(--text3);' : ''}">${topic}</span>
                </label>
                <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                  ${chatLink ? `
                    <a href="${chatLink}" target="_blank" class="chat-icon-btn" title="Open ChatGPT study link" style="color:var(--accent2); font-size:12px; display:inline-flex; align-items:center; justify-content:center; padding:4px;"><i class="fas fa-robot"></i></a>
                  ` : ''}
                  <button onclick="editTopicChatLink('${sub}', '${topic}')" class="btn-sm" style="padding:2px 5px; font-size:9.5px; border-radius:4px; height:20px; line-height:1;" title="Set ChatGPT Link"><i class="fas fa-link"></i></button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function toggleTopic(sub, topic, cb) {
  if (!S.subjects[sub]) S.subjects[sub] = {};
  S.subjects[sub][topic] = cb.checked;
  if (cb.checked) {
    addXP(8);
    if (window.event) {
      const e = window.event;
      if (e.clientX && e.clientY) {
        spawnConfetti(e.clientX, e.clientY);
      }
    }
  }
  save();
  renderSubjects();
  renderDashboard();
}

function editTopicChatLink(sub, topic) {
  const current = S.subjects[sub]?.[topic + '_chat_link'] || '';
  const url = prompt(`Enter ChatGPT/Study link for "${topic}":`, current);
  if (url === null) return;
  if (!S.subjects[sub]) S.subjects[sub] = {};
  S.subjects[sub][topic + '_chat_link'] = url.trim();
  save();
  renderSubjects();
  toast('Study link saved!');
}

window.editTopicChatLink = editTopicChatLink;

// ── COMMUNICATION & SOFT SKILLS ──
function renderCommSkillsOverview() {
  const overview = document.getElementById('comm-overview');
  if (!overview) return;

  const skills = COMM_SKILLS;
  const prefix = 'comm';
  let total = skills.length;
  let proficientCount = 0;
  let sumVal = 0;
  skills.forEach(skill => {
    const key = `${prefix}_${skill}`;
    const val = S.skills[key] || 0;
    if (val >= 3) proficientCount++;
    sumVal += val;
  });

  const avgVal = total > 0 ? (sumVal / total) : 0;
  const avgPct = Math.round((avgVal / 4) * 100);

  overview.innerHTML = `
    <div class="skill-ov-chip"><i class="fas fa-layer-group"></i> Total: <b>${total} topics</b></div>
    <div class="skill-ov-chip"><i class="fas fa-award"></i> Ready: <b>${proficientCount} proficient</b></div>
    <div class="skill-ov-chip"><i class="fas fa-chart-pie"></i> Mastery: <b>${avgPct}%</b></div>
  `;
}

function renderCommSkills() {
  renderSkillTrackers('comm-trackers', COMM_SKILLS, 'comm');
  renderCommSkillsOverview();
}

function renderSoftSkillsOverview(skills, prefix) {
  const overview = document.getElementById('soft-overview');
  if (!overview) return;

  let total = skills.length;
  let proficientCount = 0;
  let sumVal = 0;
  skills.forEach(skill => {
    const key = `${prefix}_${skill}`;
    const val = S.skills[key] || 0;
    if (val >= 3) proficientCount++;
    sumVal += val;
  });

  const avgVal = total > 0 ? (sumVal / total) : 0;
  const avgPct = Math.round((avgVal / 4) * 100);

  overview.innerHTML = `
    <div class="skill-ov-chip"><i class="fas fa-layer-group"></i> Total: <b>${total} topics</b></div>
    <div class="skill-ov-chip"><i class="fas fa-award"></i> Ready: <b>${proficientCount} proficient</b></div>
    <div class="skill-ov-chip"><i class="fas fa-chart-pie"></i> Mastery: <b>${avgPct}%</b></div>
  `;
}

// ── SOFT SKILLS ROTATION ──
function renderSoftRotation() {
  const container = document.getElementById('soft-rotation-overview');
  if (!container) return;

  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  const schedule = [
    { day: 'Sunday', subject: 'Core Soft Skills', desc: 'Confidence, Time Management, Leadership, etc.', icon: 'fa-brain' },
    { day: 'Monday', subject: 'Quantitative Aptitude', desc: 'Number systems, percentages, work & time, clocks', icon: 'fa-calculator' },
    { day: 'Tuesday', subject: 'Logical Reasoning', desc: 'Series, relations, seating arrangements, directions', icon: 'fa-puzzle-piece' },
    { day: 'Wednesday', subject: 'Verbal Ability', desc: 'Grammar, synonyms, reading comprehension, spelling', icon: 'fa-comments' },
    { day: 'Thursday', subject: 'Quantitative Aptitude', desc: 'Ratios, speed & distance, stats, permutations', icon: 'fa-calculator' },
    { day: 'Friday', subject: 'Logical Reasoning', desc: 'Coding-decoding, blood relations, ranks', icon: 'fa-puzzle-piece' },
    { day: 'Saturday', subject: 'Verbal Ability', desc: 'Error correction, sentence completion, cloze test', icon: 'fa-comments' }
  ];

  const todayItem = schedule[dayIndex];

  const scheduleHtml = schedule.map((item, idx) => {
    const isToday = idx === dayIndex;
    return `
      <div class="rotation-day-card ${isToday ? 'active' : ''}" style="
        padding: 12px;
        background: ${isToday ? 'linear-gradient(135deg, rgba(0,212,170,0.15) 0%, rgba(108,99,255,0.1) 100%)' : 'rgba(255,255,255,0.02)'};
        border: 1px solid ${isToday ? 'var(--accent2)' : 'var(--border)'};
        border-radius: var(--radius);
        text-align: center;
        flex: 1;
        min-width: 110px;
        position: relative;
        transition: all 0.25s ease;
        box-shadow: ${isToday ? '0 8px 24px rgba(0,212,170,0.15)' : 'none'};
      ">
        ${isToday ? `<span style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: var(--accent); color: var(--text); font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px;">TODAY</span>` : ''}
        <div style="font-size: 11px; font-weight: 700; color: ${isToday ? 'var(--accent)' : 'var(--text3)'}; margin-bottom: 4px; text-transform: uppercase;">${item.day.slice(0, 3)}</div>
        <div style="font-size: 18px; margin-bottom: 6px; color: ${isToday ? 'var(--text)' : 'var(--text2)'};"><i class="fas ${item.icon}"></i></div>
        <div style="font-size: 11px; font-weight: 700; color: var(--text);">${item.subject}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="soft-rotation-container" style="
      margin-bottom: 20px;
      padding: 18px;
      background: var(--bg2);
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    ">
      <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; margin-bottom: 18px;">
        <div style="flex: 1; min-width: 250px;">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-calendar-check" style="color: var(--accent2);"></i> Soft Skills & Aptitude Rotation Schedule
          </h3>
          <p style="font-size: 12.5px; color: var(--text2); line-height: 1.5; margin: 0;">
            Follow this rotation to master Quantitative Aptitude, Logical Reasoning, and Verbal Ability systematically along with Core Soft Skills.
          </p>
        </div>
        <div class="today-soft-rotation-banner" style="
          background: rgba(0,212,170,0.06);
          border: 1px dashed rgba(0,212,170,0.3);
          padding: 10px 14px;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 240px;
        ">
          <div style="font-size: 22px; color: var(--accent);"><i class="fas ${todayItem.icon}"></i></div>
          <div>
            <div style="font-size: 10px; color: var(--text3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Today's Aptitude Focus</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text);">${todayItem.subject}</div>
            <div style="font-size: 10.5px; color: var(--text2); margin-top: 1px;">${todayItem.desc}</div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: space-between;">
        ${scheduleHtml}
      </div>
    </div>
  `;
}

function renderSoftSkills() {
  renderSoftRotation();
  
  let list = SOFT_SKILLS;
  let prefix = 'soft';
  if (activeSoftSkillsTab === 'quant') {
    list = QUANT_APTITUDE;
    prefix = 'quant';
  } else if (activeSoftSkillsTab === 'logical') {
    list = LOGICAL_REASONING;
    prefix = 'logical';
  } else if (activeSoftSkillsTab === 'verbal') {
    list = VERBAL_ABILITY;
    prefix = 'verbal';
  }
  renderSkillTrackers('soft-trackers', list, prefix);
  renderSoftSkillsOverview(list, prefix);
}

function switchSoftSkillsTab(tabName, element) {
  activeSoftSkillsTab = tabName;
  document.querySelectorAll('#softskills-tab-chips .chip').forEach(c => c.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  } else {
    const target = document.querySelector(`#softskills-tab-chips .chip[onclick*="${tabName}"]`);
    if (target) target.classList.add('active');
  }
  renderSoftSkills();
}

window.switchSoftSkillsTab = switchSoftSkillsTab;

function renderSkillTrackers(containerId, skills, prefix) {
  const container = document.getElementById(containerId);
  container.innerHTML = skills.map(skill => {
    const key = `${prefix}_${skill}`;
    
    if (prefix !== 'comm') {
      const milestones = S.skills[key + '_milestones'] || { learn: false, practice: false, interview: false };
      const doneCount = (milestones.learn ? 1 : 0) + (milestones.practice ? 1 : 0) + (milestones.interview ? 1 : 0);
      const progressPct = Math.round(doneCount / 3 * 100);
      const isCompleted = !!S.skills[key + '_complete'];
      
      let stageText = "Not Started";
      let stageBg = "rgba(255,255,255,0.05)";
      let stageColor = "var(--text3)";
      if (doneCount === 1) {
        stageText = "Theory Learned";
        stageBg = "rgba(108,99,255,0.15)";
        stageColor = "var(--accent)";
      } else if (doneCount === 2) {
        stageText = "Practice Done";
        stageBg = "rgba(247,201,72,0.15)";
        stageColor = "var(--gold)";
      } else if (doneCount === 3) {
        stageText = "Mastered";
        stageBg = "rgba(0,212,170,0.15)";
        stageColor = "var(--accent2)";
      }
      
      const guide = getLearningGuide(prefix, skill);
      
      return `
        <div class="skill-card soft-card ${isCompleted ? 'completed' : ''}" style="display: flex; flex-direction: column; gap: 10px; padding: 14px;">
          <div class="skill-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <label style="padding:0; margin:0; cursor:pointer; display:flex; align-items:center; gap:8px; flex: 1;">
              <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleSoftSkillComplete('${key}', this.checked)" style="width:16px; height:16px; accent-color:var(--accent2); cursor:pointer; margin-top: 2px;">
              <span class="skill-card-title" style="font-size:13.5px; font-weight:700; ${isCompleted ? 'text-decoration:line-through; color:var(--text3);' : ''}">${skill}</span>
            </label>
            <span style="font-size: 10px; font-weight: 700; color: ${stageColor}; background: ${stageBg}; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.3px; flex-shrink: 0;">${stageText}</span>
          </div>
          
          <div class="prog-bar" style="margin: 4px 0">
            <div class="prog-fill" style="width:${progressPct}%; background: ${isCompleted ? 'var(--accent2)' : 'var(--accent)'}"></div>
          </div>
          
          <div class="milestones-row" style="display: flex; gap: 6px; margin: 4px 0;">
            <button class="level-btn ${milestones.learn ? 'active' : ''}" onclick="toggleSoftMilestone('${key}', 'learn')" style="flex: 1; font-size: 10px; padding: 5px; text-align: center; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"><i class="fas fa-book-open"></i> Learn</button>
            <button class="level-btn ${milestones.practice ? 'active' : ''}" onclick="toggleSoftMilestone('${key}', 'practice')" style="flex: 1; font-size: 10px; padding: 5px; text-align: center; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"><i class="fas fa-pencil-alt"></i> Practice</button>
            <button class="level-btn ${milestones.interview ? 'active' : ''}" onclick="toggleSoftMilestone('${key}', 'interview')" style="flex: 1; font-size: 10px; padding: 5px; text-align: center; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"><i class="fas fa-user-tie"></i> Ready</button>
          </div>
          
          <textarea class="skill-notes" rows="2" placeholder="Study notes/solutions..." onchange="setSkillNote('${key}', this.value)" style="font-size: 11.5px; padding: 6px; border-radius: 6px; border-color: var(--border2);">${S.skills[key + '_note'] || ''}</textarea>
          
          <details style="background: rgba(255,255,255,0.015); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px;">
            <summary style="font-weight: 600; color: var(--accent2); cursor: pointer; outline: none; list-style: none; display: flex; align-items: center; justify-content: space-between;">
              <span><i class="fas fa-lightbulb"></i> Study Guide & Prompt</span>
              <i class="fas fa-chevron-down" style="font-size: 9px; transition: transform 0.2s;"></i>
            </summary>
            <div style="margin-top: 8px; border-top: 1px solid var(--border2); padding-top: 8px; display: flex; flex-direction: column; gap: 6px; line-height: 1.4;">
              <div><b style="color: var(--text);">How to Study:</b><br><span style="color: var(--text2);">${guide.tip}</span></div>
              <div><b style="color: var(--text);">Action Task:</b><br><span style="color: var(--text2);">${guide.task}</span></div>
              <div style="margin-top: 4px; display: flex; gap: 4px; align-items: center;">
                <button onclick="launchAITutor('${skill.replace(/'/g, "\\'")}', '${prefix}')" class="btn" style="flex: 1; font-size: 10px; height: 26px; padding: 0 8px; background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.25); color: var(--accent); cursor: pointer; font-weight: 600;"><i class="fas fa-robot"></i> ChatGPT Tutor</button>
                <button onclick="copyTutorPrompt('${skill.replace(/'/g, "\\'")}', '${prefix}')" class="btn" style="height: 26px; padding: 0 8px; background: none; border-color: var(--border2); color: var(--text2); cursor: pointer;" title="Copy Prompt"><i class="fas fa-copy"></i></button>
              </div>
            </div>
          </details>
        </div>
      `;
    } else {
      const val = S.skills[key] || 0;
      const isComp = !!S.skills[key + '_complete'];
      const levels = ['Beginner', 'Learning', 'Practicing', 'Proficient', 'Expert'];
      const chatLink = S.skills[key + '_chat_link'] || '';
      
      let extraHTML = '';
      if (skill === 'Speaking Fluency') {
        const totalMins = S.speakingPracticeMins || 0;
        const log = S.speakingPracticeLog || [];
        const recent = log.slice(0, 2).map(l => `${l.mins}m on ${l.date}`).join(', ');
        extraHTML = `
          <div class="speaking-logger" style="margin-top: 12px; padding: 10px; background: rgba(108,99,255,0.06); border-radius: 8px; border: 1px dashed rgba(108,99,255,0.25);">
            <label style="font-size: 11px; font-weight: 700; color: var(--text2); display: block; margin-bottom: 6px;"><i class="fas fa-microphone"></i> SPEAKING APP PRACTICE LOGGER</label>
            <div style="display: flex; gap: 6px; align-items: center;">
              <input type="number" id="speaking-mins-input" class="inp" placeholder="Minutes practiced..." style="font-size: 11.5px; padding: 4px 8px; height: 26px; flex: 1; min:1; max:300;">
              <button class="btn btn-sm" onclick="logSpeakingMins()" style="height: 26px; font-size: 11px; padding: 0 10px; background:var(--accent); color:white; border:none; border-radius:5px; font-weight:600; cursor:pointer;">Log</button>
            </div>
            <div style="font-size: 11px; color: var(--accent2); margin-top: 6px; font-weight: 600;" id="speaking-total-status">
              Total Practice: ${totalMins} mins
              ${recent ? `<div style="font-size: 9.5px; color: var(--text3); margin-top: 2px; font-weight: normal;">Recent: ${recent}</div>` : ''}
            </div>
          </div>
        `;
      } else if (skill === 'Vocabulary Building') {
        extraHTML = `
          <div class="vocab-logger" style="margin-top: 12px; padding: 10px; background: rgba(0,212,170,0.06); border-radius: 8px; border: 1px dashed rgba(0,212,170,0.25);">
            <label style="font-size: 11px; font-weight: 700; color: var(--text2); display: block; margin-bottom: 6px;"><i class="fas fa-book"></i> VOCABULARY BUILDER</label>
            <button class="btn btn-sm" onclick="openVocabModal()" style="width: 100%; font-size: 11px; height: 26px; background:rgba(0, 212, 170, 0.1); border-color:rgba(0, 212, 170, 0.2); color:var(--accent2); cursor:pointer;">+ Add Word with 5 Sentences</button>
            <div id="vocab-word-list" style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px; max-height: 150px; overflow-y: auto;">
              <!-- Vocab words will render here -->
            </div>
          </div>
        `;
      }
  
      return `
        <div class="skill-card ${isComp ? 'completed' : ''}">
          <div class="skill-card-header">
            <label style="padding:0;margin:0;cursor:pointer;display:flex;align-items:center;gap:8px;">
              <input type="checkbox" ${isComp ? 'checked' : ''} onchange="toggleSkillComplete('${key}', this.checked)" style="width:16px;height:16px;accent-color:var(--accent2);margin-right:2px;cursor:pointer;">
              <span class="skill-card-title" style="font-size:14px;font-weight:700;${isComp ? 'text-decoration:line-through;color:var(--text3);' : ''}">${skill}</span>
            </label>
            <span class="skill-rating">${levels[val] || 'Beginner'}</span>
          </div>
          <div class="prog-bar" style="margin-bottom:12px">
            <div class="prog-fill" style="width:${val * 25}%"></div>
          </div>
          <div class="skill-level-btns">
            ${levels.map((l, i) => `<button class="level-btn ${val === i ? 'active' : ''}" onclick="setSkill('${key}', ${i})">${l}</button>`).join('')}
          </div>
          <textarea class="skill-notes" rows="2" placeholder="Notes..." onchange="setSkillNote('${key}', this.value)">${S.skills[key + '_note'] || ''}</textarea>
          
          <div style="position:relative; margin-top:8px; display:flex; gap:6px; align-items:center;">
            <input type="url" class="inp" placeholder="ChatGPT Study Link..." onchange="setSkillChatLink('${key}', this.value)" value="${chatLink}" style="font-size:11px; padding:5px 8px; height:24px; flex:1;">
            ${chatLink ? `
              <a href="${chatLink}" target="_blank" class="btn btn-sm" style="padding:4px 8px; font-size:10px; background:rgba(0, 212, 170, 0.1); border-color:rgba(0, 212, 170, 0.2); color:var(--accent2); height:24px; display:inline-flex; align-items:center; justify-content:center;" title="Open Chat Link"><i class="fas fa-robot"></i></a>
            ` : ''}
          </div>
          ${extraHTML}
        </div>
      `;
    }
  }).join('');
  
  if (containerId === 'comm-trackers') {
    renderVocabWordList();
  }
}

function setSkill(key, val) {
  const prev = S.skills[key] || 0;
  S.skills[key] = val;
  S.skills[key + '_complete'] = (val === 4);
  if (val > prev) addXP(5);
  save();
  renderCommSkills();
  renderSoftSkills();
}

function toggleSkillComplete(key, isChecked) {
  const prev = S.skills[key] || 0;
  const newVal = isChecked ? 4 : 0;
  S.skills[key] = newVal;
  S.skills[key + '_complete'] = isChecked;
  if (newVal > prev) addXP(5);
  save();
  renderCommSkills();
  renderSoftSkills();
}

window.toggleSkillComplete = toggleSkillComplete;

function setSkillNote(key, val) {
  S.skills[key + '_note'] = val;
  save();
}

function setSkillChatLink(key, val) {
  S.skills[key + '_chat_link'] = val.trim();
  save();
  renderCommSkills();
  renderSoftSkills();
}

window.setSkillChatLink = setSkillChatLink;

// ── PROJECTS ──
function addProject() {
  const name = document.getElementById('proj-name').value.trim();
  if (!name) return toast('Enter project name', 'error');
  const proj = {
    id: Date.now(), name,
    tech: document.getElementById('proj-tech').value.trim(),
    github: document.getElementById('proj-github').value.trim(),
    status: document.getElementById('proj-status').value,
    pct: parseInt(document.getElementById('proj-pct').value) || 0
  };
  S.projects.push(proj);
  ['proj-name', 'proj-tech', 'proj-github', 'proj-pct'].forEach(id => document.getElementById(id).value = '');
  addXP(20);
  save();
  renderProjects();
  renderDashboard();
  toast(`🚀 "${name}" added to projects!`);
}

function renderProjects() {
  const list = document.getElementById('projects-list');
  if (!S.projects.length) {
    list.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:20px">No projects yet. Showcase your work! 🚀</div>`;
    return;
  }
  list.innerHTML = S.projects.map(p => `
    <div class="project-card">
      <div class="project-name">${p.name}</div>
      <div class="project-tech">${p.tech || 'No tech stack listed'}</div>
      <span class="project-status-tag status-${p.status.replace(' ', '-')}">${p.status}</span>
      <div class="progress-label"><span>Completion</span><span>${p.pct}%</span></div>
      <div class="prog-bar" style="margin-bottom:12px">
        <div class="prog-fill" style="width:${p.pct}%"></div>
      </div>
      <div class="project-footer">
        ${p.github ? `<a href="${p.github}" target="_blank" class="github-link"><i class="fab fa-github"></i> GitHub</a>` : '<span style="color:var(--text3);font-size:12px">No GitHub link</span>'}
        <button class="btn-danger" onclick="deleteProject(${p.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function deleteProject(id) {
  S.projects = S.projects.filter(p => p.id !== id);
  save();
  renderProjects();
  renderDashboard();
  toast('Project removed');
}

// ── PLACEMENT ──
function renderPlacement() {
  restoreCheckboxes('.placement-items', S.placementChecks, 'data-key');
  document.getElementById('mock-count').textContent = S.mocks;
  document.getElementById('app-count').textContent = S.apps;
  updateMockBar();
  renderPipeline();

  // Update card percentages dynamically
  updatePlacementCardPct('resume-pct', ['resume-made', 'resume-ats', 'resume-reviewed', 'resume-1page', 'resume-links', 'resume-action']);
  updatePlacementCardPct('li-pct', ['li-photo', 'li-headline', 'li-about', 'li-500', 'li-skills', 'li-projects']);
  updatePlacementCardPct('priorities-pct', ['priority-dsa', 'priority-python', 'priority-fastapi', 'priority-react', 'priority-sql', 'priority-docker', 'priority-aws', 'priority-projects', 'priority-aiml']);

  // Calculate dynamic Placement Readiness Score
  const resumeDone = ['resume-made', 'resume-ats', 'resume-reviewed', 'resume-1page', 'resume-links', 'resume-action'].filter(k => S.placementChecks[k]).length;
  const liDone = ['li-photo', 'li-headline', 'li-about', 'li-500', 'li-skills', 'li-projects'].filter(k => S.placementChecks[k]).length;
  const prioritiesDone = ['priority-dsa', 'priority-python', 'priority-fastapi', 'priority-react', 'priority-sql', 'priority-docker', 'priority-aws', 'priority-projects', 'priority-aiml'].filter(k => S.placementChecks[k]).length;

  const mockPct = Math.min(1, S.mocks / 20);
  const appPct = Math.min(1, S.apps / 10);

  const totalScore = Math.round((
    (resumeDone / 6) * 0.25 + 
    (liDone / 6) * 0.15 + 
    (prioritiesDone / 9) * 0.35 + 
    mockPct * 0.15 + 
    appPct * 0.10
  ) * 100);

  const plrPctEl = document.getElementById('plr-pct');
  if (plrPctEl) plrPctEl.textContent = totalScore + '%';
  const plrBarEl = document.getElementById('plr-bar');
  if (plrBarEl) plrBarEl.style.width = totalScore + '%';
}

function updatePlacementCardPct(elemId, keys) {
  const done = keys.filter(k => S.placementChecks[k]).length;
  const pct = Math.round((done / keys.length) * 100);
  const el = document.getElementById(elemId);
  if (el) el.textContent = pct + '%';
}

function restoreCheckboxes(selector, store, attr) {
  document.querySelectorAll(`${selector} input[${attr}]`).forEach(cb => {
    cb.checked = !!store[cb.getAttribute(attr)];
  });
}

function togglePlacement(cb) {
  S.placementChecks[cb.dataset.key] = cb.checked;
  if (cb.checked) {
    addXP(10);
    if (window.event) {
      const e = window.event;
      if (e.clientX && e.clientY) {
        spawnConfetti(e.clientX, e.clientY);
      }
    }
  }
  save();
  renderDashboard();
  renderPlacement();
}

function changeMock(delta) {
  S.mocks = Math.max(0, S.mocks + delta);
  if (delta > 0) {
    addXP(15);
    if (window.event) {
      const e = window.event;
      if (e.clientX && e.clientY) {
        spawnConfetti(e.clientX, e.clientY);
      }
    }
  }
  document.getElementById('mock-count').textContent = S.mocks;
  updateMockBar();
  save();
  renderDashboard();
  renderPlacement();
}

function updateMockBar() {
  const pct = Math.min(100, S.mocks / 20 * 100);
  document.getElementById('mock-bar').style.width = pct + '%';
  document.getElementById('mock-pct').textContent = Math.round(pct) + '%';
}

function changeApp(delta) {
  S.apps = Math.max(0, S.apps + delta);
  document.getElementById('app-count').textContent = S.apps;
  save();
  renderPlacement();
}

function addApplication() {
  const co = document.getElementById('app-company').value.trim();
  if (!co) return toast('Enter company name', 'error');
  const status = document.getElementById('app-status').value;
  S.applications.push({ id: Date.now(), company: co, status, date: TODAY_KEY });
  S.apps++;
  document.getElementById('app-company').value = '';
  document.getElementById('app-count').textContent = S.apps;
  addXP(5);
  save();
  renderPipeline();
  toast(`📩 ${co} tracked!`);
}

const STATUS_CLASS = { 'Applied': 'ps-Applied', 'OA Received': 'ps-OA', 'Interview Scheduled': 'ps-Interview', 'Offer': 'ps-Offer', 'Rejected': 'ps-Rejected' };

function renderPipeline() {
  const el = document.getElementById('company-pipeline');
  if (!S.applications.length) {
    el.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:16px">No applications tracked yet. Start applying! 📩</div>`;
    return;
  }
  el.innerHTML = [...S.applications].reverse().map(a => `
    <div class="pipeline-item">
      <span class="pipeline-company">${a.company}</span>
      <span class="pipeline-status ${STATUS_CLASS[a.status] || 'ps-Applied'}">${a.status}</span>
      <span style="font-size:11px;color:var(--text3);font-family:var(--mono)">${a.date}</span>
      <button class="btn-danger" onclick="deleteApp(${a.id})"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

function deleteApp(id) {
  S.applications = S.applications.filter(a => a.id !== id);
  save();
  renderPipeline();
}

// ── ANALYTICS ──
function linkedinScore() {
  const keys = ['li-photo', 'li-headline', 'li-about', 'li-500', 'li-skills', 'li-projects'];
  return keys.filter(k => S.placementChecks[k]).length / keys.length;
}

function renderAnalytics() {
  renderAnalyticsSummary();
  renderCatChart();
  renderSubjChart();
  renderDiffSplit();
  renderPlacementScoreChart();
  renderHoursChart();
}

function renderAnalyticsSummary() {
  const el = document.getElementById('analytics-summary');
  if (!el) return;
  el.innerHTML = `
    <div class="an-summary-card">
      <div class="an-val">${S.dsa.length}</div>
      <div class="an-label">DSA Solved</div>
    </div>
    <div class="an-summary-card">
      <div class="an-val">${totalHours()}h</div>
      <div class="an-label">Study Hours</div>
    </div>
    <div class="an-summary-card">
      <div class="an-val">${S.streak}</div>
      <div class="an-label">Day Streak</div>
    </div>
    <div class="an-summary-card">
      <div class="an-val">${S.xp}</div>
      <div class="an-label">Total XP</div>
    </div>
  `;
}

function renderCatChart() {
  const el = document.getElementById('cat-chart');
  if (!el) return;
  const counts = {};
  DSA_CATS.forEach(c => counts[c] = 0);
  S.dsa.forEach(p => { if (counts[p.cat] !== undefined) counts[p.cat]++; });
  const max = Math.max(...Object.values(counts), 1);
  el.innerHTML = DSA_CATS.map(c => `
    <div class="chart-bar-row">
      <span class="chart-label">${c}</span>
      <div class="chart-bar-wrap"><div class="chart-bar-fill" style="width:${counts[c]/max*100}%"></div></div>
      <span class="chart-value">${counts[c]}</span>
    </div>
  `).join('');
}

function renderSubjChart() {
  const el = document.getElementById('subj-chart');
  if (!el) return;
  el.innerHTML = Object.keys(SUBJECTS_DATA).map(sub => {
    const pct = subjectPct(sub);
    return `
      <div class="chart-bar-row">
        <span class="chart-label">${sub}</span>
        <div class="chart-bar-wrap"><div class="chart-bar-fill" style="width:${pct}%"></div></div>
        <span class="chart-value">${pct}%</span>
      </div>
    `;
  }).join('');
}

function renderDiffSplit() {
  const el = document.getElementById('diff-split');
  if (!el) return;
  const easy = S.dsa.filter(p => p.diff === 'Easy').length;
  const med = S.dsa.filter(p => p.diff === 'Medium').length;
  const hard = S.dsa.filter(p => p.diff === 'Hard').length;
  const total = easy + med + hard || 1;
  const easyPct = Math.round(easy / total * 100);
  const medPct = Math.round(med / total * 100);
  const hardPct = Math.round(hard / total * 100);
  el.innerHTML = `
    <div class="diff-row">
      <span class="diff-label">Easy</span>
      <div class="diff-bar">
        <div class="diff-fill easy" style="width:${Math.max(8, easyPct)}%">${easyPct}% (${easy})</div>
      </div>
    </div>
    <div class="diff-row">
      <span class="diff-label">Medium</span>
      <div class="diff-bar">
        <div class="diff-fill med" style="width:${Math.max(8, medPct)}%">${medPct}% (${med})</div>
      </div>
    </div>
    <div class="diff-row">
      <span class="diff-label">Hard</span>
      <div class="diff-bar">
        <div class="diff-fill hard" style="width:${Math.max(8, hardPct)}%">${hardPct}% (${hard})</div>
      </div>
    </div>
  `;
}

function renderPlacementScoreChart() {
  const el = document.getElementById('placement-score-chart');
  if (!el) return;
  const resumePct = Math.round(resumeScore() * 100);
  const liPct = Math.round(linkedinScore() * 100);
  const mockPct = Math.round(Math.min(100, S.mocks / 20 * 100));
  el.innerHTML = `
    <div class="chart-bar-row">
      <span class="chart-label">Resume</span>
      <div class="chart-bar-wrap"><div class="chart-bar-fill" style="width:${resumePct}%"></div></div>
      <span class="chart-value">${resumePct}%</span>
    </div>
    <div class="chart-bar-row">
      <span class="chart-label">LinkedIn</span>
      <div class="chart-bar-wrap"><div class="chart-bar-fill" style="width:${liPct}%"></div></div>
      <span class="chart-value">${liPct}%</span>
    </div>
    <div class="chart-bar-row">
      <span class="chart-label">Mocks</span>
      <div class="chart-bar-wrap"><div class="chart-bar-fill" style="width:${mockPct}%"></div></div>
      <span class="chart-value">${mockPct}%</span>
    </div>
  `;
}

function renderHoursChart() {
  const el = document.getElementById('hours-chart');
  if (!el) return;
  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: DAYS[d.getDay()], hrs: S.hours[key] || 0, key });
  }
  const max = Math.max(...days.map(d => d.hrs), 1);
  el.innerHTML = `
    <div class="line-chart-outer">
      <div class="line-chart-bars-row">
        ${days.map(d => `
          <div class="line-day-bar">
            <span class="line-day-value">${d.hrs > 0 ? d.hrs + 'h' : ''}</span>
            <div class="line-day-bar-inner" style="height:${Math.max(4, d.hrs/max*100)}px"></div>
            <span class="line-day-label">${d.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── TOAST ──
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3000);
  }
}

// ── DASHBOARD MOTIVATION ROTATOR ──
function initDashQuoteRotator() {
  const quoteEl = document.getElementById('dash-quote');
  const authorEl = document.getElementById('dash-quote-author');
  if (!quoteEl || !authorEl) return;

  let idx = Math.floor(Math.random() * DASH_QUOTES.length);
  
  function updateQuote() {
    quoteEl.style.opacity = '0';
    authorEl.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % DASH_QUOTES.length;
      quoteEl.textContent = `"${DASH_QUOTES[idx].q}"`;
      authorEl.textContent = `— ${DASH_QUOTES[idx].a}`;
      quoteEl.style.opacity = '1';
      authorEl.style.opacity = '1';
    }, 500);
  }

  // Set initial quote
  quoteEl.textContent = `"${DASH_QUOTES[idx].q}"`;
  authorEl.textContent = `— ${DASH_QUOTES[idx].a}`;

  // Rotate every 10 seconds
  setInterval(updateQuote, 10000);
}

// ── CLOUD & EXTRA SKILLS ──
function renderCustomSkillsSummary() {
  const el = document.getElementById('extraskills-summary-stats');
  if (!el) return;

  if (!S.customSkills) S.customSkills = [];

  const totalSkills = S.customSkills.length;
  let totalTopics = 0;
  let completedTopics = 0;

  S.customSkills.forEach(s => {
    totalTopics += s.topics.length;
    completedTopics += s.topics.filter(t => t.completed).length;
  });

  el.innerHTML = `
    <div class="skill-ov-chip"><i class="fas fa-folder"></i> Paths: <b>${totalSkills} active</b></div>
    <div class="skill-ov-chip"><i class="fas fa-book-open"></i> Topics: <b>${totalTopics} tracked</b></div>
    <div class="skill-ov-chip"><i class="fas fa-check-circle"></i> Completed: <b>${completedTopics} done</b></div>
  `;
}

function renderCustomSkills() {
  const container = document.getElementById('custom-skills-container');
  if (!container) return;

  if (!S.customSkills) S.customSkills = [];

  renderCustomSkillsSummary();

  if (S.customSkills.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:40px; color:var(--text3); border-color:var(--border);">
        <div style="font-size:40px; margin-bottom:12px;">☁️</div>
        <h3 style="color:#fff;">No Custom Skills Yet</h3>
        <p style="font-size:13px; margin-top:4px; color:var(--text2);">Create your first custom skill path (e.g., Cloud Computing) above to get started!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = S.customSkills.map(skill => {
    const totalTopics = skill.topics.length;
    const completedTopics = skill.topics.filter(t => t.completed).length;
    const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return `
      <div class="card full-card">
        <div class="card-header" style="border-bottom: 1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:20px;">☁️</span>
            <div>
              <span style="font-size:16px; font-weight:700; color:#fff; text-transform:none;">${skill.name}</span>
              <span style="font-size:11px; color:var(--text2); display:block; text-transform:none; font-weight:normal; letter-spacing:0; margin-top:2px;">${completedTopics}/${totalTopics} topics complete</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px; text-transform:none;">
            <div style="width:120px; text-align:right;">
              <div class="progress-label" style="margin-bottom:3px;"><span style="font-size:10px;">Progress</span><span style="font-size:10px; font-family:var(--mono);">${pct}%</span></div>
              <div class="prog-bar" style="height:6px;"><div class="prog-fill" style="width:${pct}%;"></div></div>
            </div>
            <button class="btn-danger" onclick="deleteCustomSkill(${skill.id})" title="Delete Skill Path" style="padding:6px 10px;"><i class="fas fa-trash"></i></button>
          </div>
        </div>

        <div style="display:flex; gap:20px; flex-wrap:wrap;">
          <!-- Left: Add Topic Form inside this skill -->
          <div style="flex:1; min-width:280px; background:var(--bg3); padding:16px; border-radius:10px; border:1px solid var(--border); align-self:flex-start;">
            <h4 style="font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; margin-bottom:12px; letter-spacing:0.5px;"><i class="fas fa-plus-circle" style="color:var(--accent2); margin-right:4px;"></i> Add Topic</h4>
            <div class="form-grid" style="grid-template-columns:1fr; gap:10px;">
              <input type="text" id="topic-name-${skill.id}" class="inp" placeholder="Topic name (e.g. AWS S3, Cloud Models)" />
              <textarea id="topic-desc-${skill.id}" class="inp" rows="3" placeholder="What did you learn? Detailed notes..." style="resize:none; font-size:12px;"></textarea>
              <input type="url" id="topic-link-${skill.id}" class="inp" placeholder="ChatGPT Link or Study resource link" />
            </div>
            <button class="btn btn-primary" onclick="addCustomTopic(${skill.id})" style="margin-top:12px; width:100%; font-size:12px; padding:7px 14px;">
              <i class="fas fa-check"></i> Add Topic
            </button>
          </div>

          <!-- Right: List of Topics -->
          <div style="flex:2; min-width:320px; display:flex; flex-direction:column; gap:10px;">
            <h4 style="font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;"><i class="fas fa-list-ul" style="margin-right:4px;"></i> Topics (${totalTopics})</h4>
            ${totalTopics === 0 ? `
              <div style="color:var(--text3); font-size:12px; text-align:center; padding:32px 0;">No topics added to this skill path yet. Add one on the left! 📝</div>
            ` : skill.topics.map(topic => `
              <div class="skill-card ${topic.completed ? 'completed' : ''}" style="background:var(--bg3); border:1px solid var(--border); padding:12px 14px; border-radius:10px; transition:all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin:0; padding:0;">
                    <input type="checkbox" ${topic.completed ? 'checked' : ''} onchange="toggleCustomTopic(${skill.id}, ${topic.id}, this.checked)" style="width:16px; height:16px; accent-color:var(--accent2); cursor:pointer;">
                    <span style="font-size:13.5px; font-weight:700; ${topic.completed ? 'text-decoration:line-through; color:var(--text3);' : 'color:#fff;'}">${topic.name}</span>
                  </label>
                  <div style="display:flex; gap:6px; align-items:center;">
                    ${topic.link ? `
                      <a href="${topic.link}" target="_blank" class="btn btn-sm" style="padding:4px 8px; font-size:10px; background:rgba(0, 212, 170, 0.1); border-color:rgba(0, 212, 170, 0.2); color:var(--accent2); height:22px; display:inline-flex; align-items:center; justify-content:center; gap:4px; border-radius:6px; text-decoration:none;">
                        <i class="fas fa-robot"></i> ChatGPT
                      </a>
                    ` : ''}
                    <button class="btn-danger" onclick="deleteCustomTopic(${skill.id}, ${topic.id})" style="padding:4px 8px; font-size:10.5px; height:22px; display:inline-flex; align-items:center; justify-content:center;"><i class="fas fa-trash"></i></button>
                  </div>
                </div>
                ${topic.desc ? `
                  <p style="font-size:12px; color:var(--text2); margin-top:8px; margin-left:24px; line-height:1.5; white-space:pre-wrap;">${topic.desc}</p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function addCustomSkill() {
  const nameInput = document.getElementById('custom-skill-name');
  if (!nameInput) return;
  const name = nameInput.value.trim();
  if (!name) return toast('Enter skill path name', 'error');

  if (!S.customSkills) S.customSkills = [];

  const skill = {
    id: Date.now(),
    name,
    topics: []
  };

  S.customSkills.push(skill);
  nameInput.value = '';
  addXP(15);
  save();
  renderCustomSkills();
  toast(`☁️ Custom path "${name}" created!`);
}

function deleteCustomSkill(skillId) {
  if (!confirm('Are you sure you want to delete this custom skill path and all its topics?')) return;
  S.customSkills = S.customSkills.filter(s => s.id !== skillId);
  save();
  renderCustomSkills();
  toast('Skill path removed');
}

function addCustomTopic(skillId) {
  const nameInput = document.getElementById(`topic-name-${skillId}`);
  const descInput = document.getElementById(`topic-desc-${skillId}`);
  const linkInput = document.getElementById(`topic-link-${skillId}`);

  if (!nameInput || !descInput || !linkInput) return;

  const name = nameInput.value.trim();
  const desc = descInput.value.trim();
  const link = linkInput.value.trim();

  if (!name) return toast('Enter topic name', 'error');

  const skill = S.customSkills.find(s => s.id === skillId);
  if (!skill) return;

  const topic = {
    id: Date.now(),
    name,
    desc,
    link,
    completed: false
  };

  skill.topics.push(topic);
  nameInput.value = '';
  descInput.value = '';
  linkInput.value = '';

  addXP(5);
  save();
  renderCustomSkills();
  toast(`📝 Topic "${name}" added!`);
}

function deleteCustomTopic(skillId, topicId) {
  const skill = S.customSkills.find(s => s.id === skillId);
  if (!skill) return;

  skill.topics = skill.topics.filter(t => t.id !== topicId);
  save();
  renderCustomSkills();
  toast('Topic deleted');
}

function toggleCustomTopic(skillId, topicId, isChecked) {
  const skill = S.customSkills.find(s => s.id === skillId);
  if (!skill) return;

  const topic = skill.topics.find(t => t.id === topicId);
  if (!topic) return;

  topic.completed = isChecked;
  if (isChecked) addXP(5);
  save();
  renderCustomSkills();
}

window.addCustomSkill = addCustomSkill;
window.deleteCustomSkill = deleteCustomSkill;
window.addCustomTopic = addCustomTopic;
window.deleteCustomTopic = deleteCustomTopic;
window.toggleCustomTopic = toggleCustomTopic;
window.renderCustomSkills = renderCustomSkills;

// ── UTILS ──
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// ── SPEAKING APP PRACTICE LOGGER ──
function logSpeakingMins() {
  const input = document.getElementById('speaking-mins-input');
  if (!input) return;
  const mins = parseInt(input.value, 10);
  if (isNaN(mins) || mins <= 0) {
    return toast('Please enter a valid number of minutes.', 'error');
  }
  
  if (!S.speakingPracticeLog) S.speakingPracticeLog = [];
  S.speakingPracticeMins = (S.speakingPracticeMins || 0) + mins;
  
  const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  S.speakingPracticeLog.unshift({
    date: dateStr,
    mins: mins,
    timestamp: Date.now()
  });
  
  const hours = mins / 60;
  input.value = '';
  
  // Log study hours (automatically saves & re-renders dashboard)
  addStudyHours(hours, false);
  
  // Re-render Communication Skills to update total practice count & log lists
  renderCommSkills();
  
  toast(`🎙️ Logged ${mins} minutes of speaking practice!`);
}

// ── VOCABULARY BUILDER ──
function openVocabModal() {
  // If modal already exists, remove it first
  closeVocabModal();
  
  const modalHtml = `
    <div class="modal-overlay show" id="vocab-modal-overlay" onclick="closeVocabModal()">
      <div class="modal" onclick="event.stopPropagation()" style="max-width: 500px; text-align: left; padding: 24px;">
        <h3 style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px; font-size: 18px; color: var(--text);">
          <i class="fas fa-book" style="color: var(--accent2);"></i> Add Vocabulary Word
        </h3>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--text2); display: block; margin-bottom: 4px;">Word</label>
            <input type="text" id="vocab-word-input" class="inp" placeholder="e.g. Ephemeral" style="width: 100%; font-size: 13px; padding: 8px 12px; height: auto;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--text2); display: block; margin-bottom: 4px;">Meaning</label>
            <input type="text" id="vocab-meaning-input" class="inp" placeholder="e.g. Lasting for a very short time" style="width: 100%; font-size: 13px; padding: 8px 12px; height: auto;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--text2); display: block; margin-bottom: 6px;">5 Real-World Example Sentences</label>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <input type="text" class="inp vocab-sentence-input" placeholder="Sentence 1..." style="width: 100%; font-size: 12.5px; padding: 6px 10px; height: auto;">
              <input type="text" class="inp vocab-sentence-input" placeholder="Sentence 2..." style="width: 100%; font-size: 12.5px; padding: 6px 10px; height: auto;">
              <input type="text" class="inp vocab-sentence-input" placeholder="Sentence 3..." style="width: 100%; font-size: 12.5px; padding: 6px 10px; height: auto;">
              <input type="text" class="inp vocab-sentence-input" placeholder="Sentence 4..." style="width: 100%; font-size: 12.5px; padding: 6px 10px; height: auto;">
              <input type="text" class="inp vocab-sentence-input" placeholder="Sentence 5..." style="width: 100%; font-size: 12.5px; padding: 6px 10px; height: auto;">
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-sm" onclick="closeVocabModal()" style="background: none; border: 1px solid var(--border2); color: var(--text2);">Cancel</button>
          <button class="btn" onclick="saveVocabWord()" style="background: var(--accent2); color: var(--bg); border: none; font-weight: 600; padding: 6px 16px; border-radius: 6px;">Save Word</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.id = 'vocab-modal-container';
  div.innerHTML = modalHtml;
  document.body.appendChild(div);
}

function closeVocabModal() {
  const container = document.getElementById('vocab-modal-container');
  if (container) {
    container.remove();
  }
}

function saveVocabWord() {
  const wordInput = document.getElementById('vocab-word-input');
  const meaningInput = document.getElementById('vocab-meaning-input');
  if (!wordInput || !meaningInput) return;
  
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  const inputs = document.querySelectorAll('.vocab-sentence-input');
  const sentences = Array.from(inputs).map(inp => inp.value.trim()).filter(Boolean);
  
  if (!word || !meaning) {
    return toast('Please enter both the word and its meaning.', 'error');
  }
  
  if (sentences.length < 5) {
    return toast('Please enter all 5 real-world sentences.', 'error');
  }
  
  if (!S.vocabulary) S.vocabulary = [];
  S.vocabulary.unshift({
    word,
    meaning,
    sentences
  });
  
  // Award 10 XP for building vocabulary!
  addXP(10);
  save();
  closeVocabModal();
  renderCommSkills();
  toast(`📝 Added "${word}" to vocabulary builder!`);
}

// Delete vocab word helper
function deleteVocabWord(idx) {
  if (!confirm("Are you sure you want to delete this vocabulary word?")) return;
  if (!S.vocabulary) S.vocabulary = [];
  S.vocabulary.splice(idx, 1);
  save();
  renderCommSkills();
  toast("Word deleted.");
}

function renderVocabWordList() {
  const container = document.getElementById('vocab-word-list');
  if (!container) return;
  
  const vocab = S.vocabulary || [];
  if (vocab.length === 0) {
    container.innerHTML = `<div style="font-size: 10.5px; color: var(--text3); text-align: center; padding: 8px 0;">No words added yet.</div>`;
    return;
  }
  
  container.innerHTML = vocab.map((item, idx) => {
    const escWord = escHtml(item.word);
    const escMeaning = escHtml(item.meaning);
    const sentsHtml = item.sentences.map((s, sIdx) => `<li style="margin-bottom: 4px; line-height:1.4;">${sIdx + 1}. "${escHtml(s)}"</li>`).join('');
    
    return `
      <details style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11.5px; color: var(--text2); transition: all 0.2s;">
        <summary style="font-weight: 600; color: var(--text); cursor: pointer; display: flex; justify-content: space-between; align-items: center; outline: none; list-style: none;">
          <span style="display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-chevron-right" style="font-size: 9px; color: var(--accent2); transition: transform 0.2s;"></i>
            <b>${escWord}</b>
          </span>
          <button onclick="event.stopPropagation(); deleteVocabWord(${idx})" style="background: none; border: none; color: var(--text3); cursor: pointer; padding: 2px 6px; font-size: 10px;" onmouseover="this.style.color='var(--hard)'" onmouseout="this.style.color='var(--text3)'">
            <i class="fas fa-trash"></i>
          </button>
        </summary>
        <div style="margin-top: 6px; padding-left: 14px; border-left: 2px solid var(--border2); font-size: 11px;">
          <div style="margin-bottom: 6px;"><b>Meaning:</b> ${escMeaning}</div>
          <div style="font-weight: 600; margin-bottom: 4px; color: var(--accent);">Example Sentences:</div>
          <ul style="margin: 0; padding-left: 12px; color: var(--text2); list-style-type: none;">
            ${sentsHtml}
          </ul>
        </div>
      </details>
    `;
  }).join('');
}

// Expose functions to window
window.logSpeakingMins = logSpeakingMins;
window.openVocabModal = openVocabModal;
window.closeVocabModal = closeVocabModal;
window.saveVocabWord = saveVocabWord;
window.deleteVocabWord = deleteVocabWord;
window.renderVocabWordList = renderVocabWordList;

// ── SOFT SKILLS MILESTONES & TUTOR INTERFACE ──
function getLearningGuide(prefix, skill) {
  const s = skill.toLowerCase();
  
  if (prefix === 'soft') {
    if (s.includes('confidence')) {
      return {
        tip: "Identify your core strengths. Focus on active posture, power-posing, and positive reinforcement.",
        task: "Explain your top coding project aloud to yourself in a mirror for 3 minutes without stopping."
      };
    }
    if (s.includes('presentation')) {
      return {
        tip: "Structure slides/talks into: Hook, Core Message, and Call-to-Action. Pace yourself and use pauses.",
        task: "Record a 2-minute video presenting a simple code concept. Watch it to note eye contact and voice pitch."
      };
    }
    if (s.includes('time management')) {
      return {
        tip: "Use the Eisenhower Matrix (Urgent vs. Important). Implement 25-minute Pomodoro focus blocks.",
        task: "Block out tomorrow's schedule on a calendar, assigning specific hours to your top 3 tasks."
      };
    }
    if (s.includes('problem solving')) {
      return {
        tip: "Break large problems down into small logical steps. Write down inputs, outputs, and constraints first.",
        task: "Take a hard problem statement, write down the pseudocode step-by-step, and explain it aloud."
      };
    }
    if (s.includes('leadership')) {
      return {
        tip: "Leadership is about influence and enabling others. Practice taking initiative and active listening.",
        task: "Draft a 1-page team distribution plan for a group project, assigning tasks based on strengths."
      };
    }
    if (s.includes('teamwork')) {
      return {
        tip: "Communicate proactively. Appreciate team members' contributions and resolve disagreements constructively.",
        task: "Write a short paragraph detailing how you would handle a team member who is not delivering their part."
      };
    }
    return {
      tip: "Read case studies, observe leaders, and practice active listening in group projects.",
      task: "Summarize a soft skill scenario and outline 3 bullet points on how to handle it professionally."
    };
  }
  
  if (prefix === 'quant') {
    if (s.includes('percent') || s.includes('profit')) {
      return {
        tip: "Master fraction-to-percentage conversions (e.g. 1/6 = 16.67%, 1/8 = 12.5%) for rapid mental math.",
        task: "Solve 5 profit, loss, and discount questions without writing down any calculations."
      };
    }
    if (s.includes('time and work')) {
      return {
        tip: "Convert time to work efficiency using the LCM of days. Solve for total units of work.",
        task: "Solve 3 cistern/efficiency work questions using the LCM method."
      };
    }
    if (s.includes('speed') || s.includes('distance')) {
      return {
        tip: "Use relative speed for crossing/meeting problems. Speed = Distance / Time. Know conversion 1 m/s = 3.6 km/h.",
        task: "Solve 3 problems involving trains passing poles or moving in opposite directions."
      };
    }
    if (s.includes('probability') || s.includes('permutation')) {
      return {
        tip: "Understand fundamental counting principles. n! for arrangements, nCr for selections.",
        task: "Calculate the total permutations of arranging the word 'SUCCESS' such that all vowels are together."
      };
    }
    return {
      tip: "Memorize shortcut formulas. Focus on speed and accuracy. Always eliminate obviously incorrect options.",
      task: "Solve 5 quick practice questions on this topic under a strict 1-minute timer per question."
    };
  }
  
  if (prefix === 'logical') {
    if (s.includes('blood relation')) {
      return {
        tip: "Draw a family tree. Use squares for males, circles for females, double lines for spouses, and vertical lines for generations.",
        task: "Solve 3 relation puzzles. Start tracing the relationship from the last person mentioned."
      };
    }
    if (s.includes('coding')) {
      return {
        tip: "Write down alphabet numbers (A=1, Z=26) and check opposite pairs (A-Z, B-Y, C-X). Check alternate letters.",
        task: "Decode 3 messages by matching character displacement values (e.g., +2, -1 pattern)."
      };
    }
    if (s.includes('seating')) {
      return {
        tip: "Always start circular arrangements by placing the first person at the bottom facing inwards. Place definite clues first.",
        task: "Solve an 8-person circular seating arrangement puzzle with mixed inward/outward directions."
      };
    }
    return {
      tip: "Look for differences, ratios, squares, or alternate series patterns. Eliminate options logically.",
      task: "Solve 3 number/analogy sequence puzzles and note the pattern used."
    };
  }
  
  if (prefix === 'verbal') {
    if (s.includes('grammar') || s.includes('error')) {
      return {
        tip: "Check Subject-Verb agreement, pronoun-antecedent agreement, and correct preposition usage.",
        task: "Find the grammatical errors in 5 mock test sentences and write the correct versions."
      };
    }
    if (s.includes('comprehension')) {
      return {
        tip: "Read the questions first to know what details to find, then scan the passage to extract them.",
        task: "Read a technical paragraph and write a concise 1-sentence summary of the main argument."
      };
    }
    return {
      tip: "Build your vocabulary contextually. Read sentences carefully to detect subtle word choices.",
      task: "Look up synonyms/antonyms for 3 placement-focused words and use them in sentences."
    };
  }
  
  return {
    tip: "Study key concepts, write down clear explanations, and practice under mock exam conditions.",
    task: "Complete 3 practice questions on this topic and review the detailed solutions."
  };
}

function toggleSoftMilestone(key, milestone) {
  if (!S.skills[key + '_milestones']) {
    S.skills[key + '_milestones'] = { learn: false, practice: false, interview: false };
  }
  
  const m = S.skills[key + '_milestones'];
  m[milestone] = !m[milestone];
  
  const doneCount = (m.learn ? 1 : 0) + (m.practice ? 1 : 0) + (m.interview ? 1 : 0);
  const wasCompleted = !!S.skills[key + '_complete'];
  const isNowCompleted = (doneCount === 3);
  
  S.skills[key + '_complete'] = isNowCompleted;
  
  if (isNowCompleted && !wasCompleted) {
    addXP(15); // Award bonus XP on completing all milestones!
    toast("🏆 Topic fully mastered! +15 XP");
    if (window.event) {
      const e = window.event;
      if (e.clientX && e.clientY) {
        spawnConfetti(e.clientX, e.clientY);
      }
    }
  } else {
    addXP(3);
    if (m[milestone] && window.event) {
      const e = window.event;
      if (e.clientX && e.clientY) {
        spawnConfetti(e.clientX, e.clientY);
      }
    }
  }
  
  save();
  renderSoftSkills();
  renderDashboard();
}

function toggleSoftSkillComplete(key, isChecked) {
  if (!S.skills[key + '_milestones']) {
    S.skills[key + '_milestones'] = { learn: false, practice: false, interview: false };
  }
  
  const m = S.skills[key + '_milestones'];
  m.learn = isChecked;
  m.practice = isChecked;
  m.interview = isChecked;
  
  const wasCompleted = !!S.skills[key + '_complete'];
  S.skills[key + '_complete'] = isChecked;
  
  if (isChecked && !wasCompleted) {
    addXP(15);
    toast("🏆 Topic fully mastered! +15 XP");
    if (window.event) {
      const e = window.event;
      if (e.clientX && e.clientY) {
        spawnConfetti(e.clientX, e.clientY);
      }
    }
  }
  
  save();
  renderSoftSkills();
  renderDashboard();
}

function getTutorPromptText(skill, prefix) {
  const guide = getLearningGuide(prefix, skill);
  return `Act as an expert mock interviewer and placement tutor. I am studying the topic "${skill}" under the category "${prefix}".

1. Briefly explain the core theory/strategy for this topic in 2 concise paragraphs. Use this specific approach: "${guide.tip}".
2. Give me exactly 3 realistic practice questions/challenges related to this topic (e.g. for aptitude, mathematical problems; for soft skills, scenario-based interview questions).
3. Quiz me on them one-by-one. Wait for my response before proceeding.

Let's begin!`;
}

function launchAITutor(skill, prefix) {
  const promptText = getTutorPromptText(skill, prefix);
  navigator.clipboard.writeText(promptText).then(() => {
    toast("📋 Prompt copied! Opening ChatGPT...");
    window.open("https://chatgpt.com/?q=" + encodeURIComponent("I want to practice placement prep. I have copied my tutor prompt to my clipboard, please ask me to paste it."), "_blank");
  }).catch(() => {
    window.open("https://chatgpt.com/?q=" + encodeURIComponent(promptText), "_blank");
  });
}

function copyTutorPrompt(skill, prefix) {
  const promptText = getTutorPromptText(skill, prefix);
  navigator.clipboard.writeText(promptText).then(() => {
    toast("📋 AI Tutor prompt copied!");
  }).catch(() => {
    toast("Failed to copy. Please allow clipboard permissions.", "error");
  });
}

// ── CONFETTI EXPLOSION ──
function spawnConfetti(x, y) {
  const container = document.body;
  const colors = ['#6c63ff', '#00d4aa', '#ff6b6b', '#f7c948', '#00d4aa'];
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'xp-particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Random directions
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 30;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - 40; // Bias upwards
    
    particle.style.setProperty('--dx', `${destX}px`);
    particle.style.setProperty('--dy', `${destY}px`);
    
    container.appendChild(particle);
    
    // Remove after animation finishes
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }
}

// ── DYNAMIC SPOTLIGHT EVENT LISTENER ──
document.addEventListener('mousemove', e => {
  const card = e.target.closest('.card, .subject-card, .skill-card, .project-card, .subj-overview-card, .an-summary-card, .dsa-target-banner, .placement-readiness-bar');
  if (card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }
});

window.toggleSoftMilestone = toggleSoftMilestone;
window.toggleSoftSkillComplete = toggleSoftSkillComplete;
window.launchAITutor = launchAITutor;
window.copyTutorPrompt = copyTutorPrompt;
window.spawnConfetti = spawnConfetti;

// ── 8-MONTH PLACEMENT ROADMAP DATA & LOGIC ──
const ROADMAP_DATA = {
  "Python (Master it)": [
    "Advanced Python",
    "OOP",
    "File handling",
    "Exception handling",
    "Modules",
    "Multithreading basics"
  ],
  "Frontend": [
    "HTML",
    "CSS",
    "JavaScript",
    "React.js"
  ],
  "Python Backend": [
    "FastAPI (FastAPI or Flask)",
    "REST APIs",
    "JWT Authentication",
    "API testing"
  ],
  "Database": [
    "MySQL or PostgreSQL",
    "SQL",
    "ORM (SQLAlchemy)"
  ],
  "Git & GitHub": [
    "Git Commands",
    "GitHub Workflow & PRs"
  ],
  "Docker": [
    "Docker Basics",
    "Dockerfile & Images",
    "Docker Compose"
  ],
  "AWS": [
    "EC2",
    "S3",
    "IAM",
    "VPC",
    "RDS",
    "Basic deployment"
  ],
  "Linux": [
    "Commands",
    "Shell scripting"
  ],
  "DSA": [
    "Arrays",
    "Strings",
    "Linked Lists",
    "Trees",
    "Graphs",
    "Dynamic Programming (basics)"
  ]
};

function renderRoadmap() {
  const grid = document.getElementById('roadmap-grid');
  if (!grid) return;

  let totalTopics = 0;
  let completedTopics = 0;

  grid.innerHTML = Object.keys(ROADMAP_DATA).map(category => {
    const topics = ROADMAP_DATA[category];
    const doneTopics = topics.filter(topic => {
      const key = `${category}_${topic}`;
      return !!S.roadmapChecks[key];
    });

    totalTopics += topics.length;
    completedTopics += doneTopics.length;

    const pct = topics.length > 0 ? Math.round((doneTopics.length / topics.length) * 100) : 0;

    return `
      <div class="subject-card">
        <div class="subject-title">
          <span>${category}</span>
          <span class="subject-pct">${pct}%</span>
        </div>
        <div class="subject-topic-count">${doneTopics.length} / ${topics.length} completed</div>
        
        <div class="prog-bar" style="height: 6px; margin: 4px 0 16px 0;">
          <div class="prog-fill" style="width: ${pct}%"></div>
        </div>

        <div class="subject-topics" style="display: flex; flex-direction: column; gap: 8px;">
          ${topics.map(topic => {
            const key = `${category}_${topic}`;
            const isChecked = !!S.roadmapChecks[key];
            const notes = S.roadmapNotes[key] || '';
            const link = S.roadmapLinks[key] || '';

            return `
              <div class="roadmap-topic-row" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 8px; padding: 10px; transition: all 0.2s;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                  <label class="topic-item" style="flex: 1; display: flex; align-items: center; gap: 8px; margin: 0; cursor: pointer;">
                    <input type="checkbox" onchange="toggleRoadmapTopic('${category.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}', this)" ${isChecked ? 'checked' : ''} style="accent-color: var(--accent2);">
                    <span style="font-size: 13px; font-weight: 500; color: ${isChecked ? 'var(--text3)' : '#fff'}; text-decoration: ${isChecked ? 'line-through' : 'none'};">${topic}</span>
                  </label>
                  
                  <div style="display: flex; gap: 4px;">
                    <button class="btn btn-sm" onclick="openRoadmapNotepad('${category.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')" style="padding: 3px 6px; font-size: 10px; ${notes ? 'border-color: var(--accent2); color: var(--accent2); background: rgba(0, 212, 170, 0.05);' : ''}" title="Open Notepad in New Tab">
                      <i class="fas fa-edit"></i> ${notes ? 'Notes ✓' : 'Notes ↗'}
                    </button>
                    <button class="btn btn-sm" onclick="editRoadmapTopicLink('${category.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')" style="padding: 3px 6px; font-size: 10px; ${link ? 'border-color: var(--accent2); color: var(--accent2); background: rgba(0, 212, 170, 0.05);' : ''}" title="Link ChatGPT">
                      <i class="fas fa-link"></i> ${link ? 'Linked 🚀' : 'Link'}
                    </button>
                  </div>
                </div>

                <!-- Render chat link if exists -->
                ${link ? `
                  <div style="margin-top: 6px; font-size: 11px;">
                    <a href="${link}" target="_blank" style="color: var(--accent2); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 500;">
                      <i class="fas fa-external-link-alt"></i> Open ChatGPT Note ↗
                    </a>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top: 14px; border-top: 1px solid var(--border); padding-top: 10px; display: flex; gap: 8px;">
          <button class="btn btn-sm" onclick="launchRoadmapTutor('${category.replace(/'/g, "\\'")}')" style="flex: 1; justify-content: center; font-size: 11px; padding: 6px;"><i class="fas fa-robot"></i> ChatGPT Tutor</button>
          <button class="btn btn-sm" onclick="copyRoadmapTutorPrompt('${category.replace(/'/g, "\\'")}')" style="padding: 6px;" title="Copy Prompt"><i class="fas fa-copy"></i></button>
        </div>
      </div>
    `;
  }).join('');

  // Update overall progress bar
  const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const pctEl = document.getElementById('roadmap-pct');
  if (pctEl) pctEl.textContent = overallPct + '%';
  const barEl = document.getElementById('roadmap-bar');
  if (barEl) barEl.style.width = overallPct + '%';
}

function toggleRoadmapTopic(category, topic, cb) {
  const key = `${category}_${topic}`;
  S.roadmapChecks[key] = cb.checked;
  if (cb.checked) {
    addXP(10);
    if (window.event) {
      const e = window.event;
      if (e.clientX && e.clientY) {
        spawnConfetti(e.clientX, e.clientY);
      }
    }
  }
  save();
  renderRoadmap();
  renderDashboard();
}

function toggleRoadmapNoteForm(category, topic) {
  const safeCat = category.replace(/[^a-zA-Z0-9]/g, '');
  const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '');
  const drawer = document.getElementById(`note-drawer-${safeCat}-${safeTopic}`);
  if (drawer) {
    drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
  }
}

function saveRoadmapTopicNote(category, topic) {
  const safeCat = category.replace(/[^a-zA-Z0-9]/g, '');
  const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '');
  const val = document.getElementById(`note-textarea-${safeCat}-${safeTopic}`)?.value.trim() || '';
  const key = `${category}_${topic}`;
  
  S.roadmapNotes[key] = val;
  save();
  renderRoadmap();
  toast('Notes saved successfully!');
}

function editRoadmapTopicLink(category, topic) {
  const key = `${category}_${topic}`;
  const current = S.roadmapLinks[key] || '';
  const url = prompt(`Enter ChatGPT conversation or study link for "${topic}":`, current);
  if (url === null) return;
  
  S.roadmapLinks[key] = url.trim();
  save();
  renderRoadmap();
  toast('ChatGPT study link saved!');
}

function getRoadmapTutorPrompt(category) {
  return `Act as an expert SDE interviewer and placement tutor. I am studying the domain "${category}" from my 8-month SDE placement roadmap.
Specifically, I need guidance and mock questions for these topics:
${ROADMAP_DATA[category].map(t => `- ${t}`).join('\n')}

Please:
1. Briefly summarize the core, interview-critical concepts for these topics.
2. Provide 3 highly realistic, frequently-asked interview questions (with coding tasks if applicable).
3. Quiz me on them one by one. Ask the first question and wait for my response.`;
}

function launchRoadmapTutor(category) {
  const promptText = getRoadmapTutorPrompt(category);
  navigator.clipboard.writeText(promptText).then(() => {
    toast("📋 Prompt copied! Opening ChatGPT...");
    window.open("https://chatgpt.com/?q=" + encodeURIComponent("I want to practice placement prep. I have copied my tutor prompt to my clipboard, please ask me to paste it."), "_blank");
  }).catch(() => {
    window.open("https://chatgpt.com/?q=" + encodeURIComponent(promptText), "_blank");
  });
}

function copyRoadmapTutorPrompt(category) {
  const promptText = getRoadmapTutorPrompt(category);
  navigator.clipboard.writeText(promptText).then(() => {
    toast("📋 Roadmap Tutor prompt copied!");
  }).catch(() => {
    toast("Failed to copy. Please allow clipboard permissions.", "error");
  });
}

function copyRoadmapNoteText(key) {
  const txt = S.roadmapNotes[key] || '';
  if (txt) {
    navigator.clipboard.writeText(txt).then(() => {
      toast('📋 Notes copied to clipboard!');
    });
  }
}

function clearRoadmapNote(category, topic) {
  if (confirm(`Are you sure you want to delete the notes for "${topic}"?`)) {
    const key = `${category}_${topic}`;
    delete S.roadmapNotes[key];
    save();
    renderRoadmap();
    toast('Notes deleted.');
  }
}

function openRoadmapNotepad(category, topic) {
  window.open(`notepad.html?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}`, '_blank');
}

// Storage event listener to sync note updates across tabs in real-time
window.addEventListener('storage', (e) => {
  if (e.key === 'placementOS_v2') {
    load();
    if (typeof renderRoadmap === 'function') renderRoadmap();
  }
});

window.toggleRoadmapTopic = toggleRoadmapTopic;
window.toggleRoadmapNoteForm = toggleRoadmapNoteForm;
window.saveRoadmapTopicNote = saveRoadmapTopicNote;
window.editRoadmapTopicLink = editRoadmapTopicLink;
window.launchRoadmapTutor = launchRoadmapTutor;
window.copyRoadmapTutorPrompt = copyRoadmapTutorPrompt;
window.renderRoadmap = renderRoadmap;
window.copyRoadmapNoteText = copyRoadmapNoteText;
window.clearRoadmapNote = clearRoadmapNote;
window.openRoadmapNotepad = openRoadmapNotepad;

// ── FLOATING AI CHATBOT COMPANION ──
function toggleAIChat() {
  const chatWindow = document.getElementById('ai-chat-window');
  const chatFab = document.getElementById('ai-bot-fab');
  if (chatWindow && chatFab) {
    chatWindow.classList.toggle('show');
    chatFab.classList.remove('pulse');
    if (chatWindow.classList.contains('show')) {
      const input = document.getElementById('ai-chat-input');
      if (input) input.focus();
    }
  }
}

function handleChatKey(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const input = document.getElementById('ai-chat-input');
  if (!input) return;
  const userText = input.value.trim();
  if (!userText) return;

  input.value = '';
  appendMessage(userText, 'user-message');

  const messagesContainer = document.getElementById('ai-chat-messages');
  const typingId = 'ai-chat-typing';
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message bot-message';
  typingIndicator.id = typingId;
  typingIndicator.innerHTML = `
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  let apiKey = localStorage.getItem('gemini_api_key') || '';
  apiKey = apiKey.trim();

  if (!apiKey) {
    setTimeout(() => {
      const indicator = document.getElementById(typingId);
      if (indicator) indicator.remove();

      let reply = "";
      const lower = userText.toLowerCase();

      if (lower.includes('dsa') || lower.includes('problem')) {
        const todayCount = typeof getTodayDSACount === 'function' ? getTodayDSACount() : 0;
        const totalCount = S.dsa ? S.dsa.length : 0;
        reply = `📊 **DSA Progress**: You have solved **${todayCount} problems today** (Target: 5). Total lifetime solved is **${totalCount}**. Keep practicing! Type 'notes' or check the roadmap for topics.`;
      } else if (lower.includes('resume')) {
        reply = `📄 **SDE Resume Tip**: Keep your resume to exactly **1 page**. Highlight SDE-related technologies (FastAPI, SQL, React) first, and include clickable GitHub links to your projects!`;
      } else if (lower.includes('mock') || lower.includes('interview')) {
        const mockCount = S.mocks ? S.mocks.length : 0;
        reply = `🤝 **Mock Interviews**: You have logged **${mockCount} mock interviews** so far. Practicing aloud is key to clearing placements!`;
      } else if (lower.includes('streak') || lower.includes('xp')) {
        reply = `🔥 **Stats**: Your current level is **${S.level || 1}**, with **${S.xp || 0} XP** and a **${S.streak || 1}-day streak**! You are doing great!`;
      } else {
        reply = `👋 **API Key Required**: I noticed you haven't linked your AI API Key yet! To enable smart, personalized conversations, click the Settings gear icon (⚙️) on any topic notes page and paste your OpenAI or Google Gemini key.
        \n\nIn the meantime, you can ask me about: **'dsa'**, **'resume'**, **'mock'**, or **'streak'**!`;
      }

      appendMessage(reply, 'bot-message');
    }, 1000);
    return;
  }

  const isOpenAI = apiKey.startsWith('sk-');
  const dsaToday = typeof getTodayDSACount === 'function' ? getTodayDSACount() : 0;
  const dsaTotal = S.dsa ? S.dsa.length : 0;
  const xp = S.xp || 0;
  const level = S.level || 1;
  const streak = S.streak || 1;

  const promptSystem = `You are a helpful, professional, and friendly SDE Placement Coach and AI Assistant built into PlacementOS.
Provide concise, highly actionable, and tech-focused answers. Keep formatting tidy using bold text, short paragraphs, or bullet points.

The user's current progress context:
- Level: ${level}
- XP: ${xp}
- Daily Streak: ${streak} days
- DSA Problems Solved Today: ${dsaToday} / 5
- Total Lifetime DSA Solved: ${dsaTotal}

Answer the user's questions about SDE placements, interview prep, resumes, mock interviews, programming concepts, or general study advice.`;

  try {
    let replyText = "";

    if (isOpenAI) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: promptSystem },
            { role: "user", content: userText }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        let errMsg = `OpenAI Error ${response.status}`;
        try {
          const errJSON = await response.json();
          if (errJSON.error && errJSON.error.message) errMsg = errJSON.error.message;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      replyText = data.choices?.[0]?.message?.content;

    } else {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${promptSystem}\n\nUser Question: ${userText}`
            }]
          }]
        })
      });

      if (!response.ok) {
        let errMsg = `Gemini Error ${response.status}`;
        try {
          const errJSON = await response.json();
          if (errJSON.error && errJSON.error.message) errMsg = errJSON.error.message;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    const indicator = document.getElementById(typingId);
    if (indicator) indicator.remove();

    if (replyText) {
      appendMessage(replyText.trim(), 'bot-message');
    } else {
      throw new Error("No response content from model");
    }

  } catch (err) {
    console.error(err);
    const indicator = document.getElementById(typingId);
    if (indicator) indicator.remove();

    appendMessage(`❌ **API Error**: ${err.message || "Failed to fetch response."}. Please verify your API Key.`, 'bot-message');
  }
}

function appendMessage(text, className) {
  const messagesContainer = document.getElementById('ai-chat-messages');
  if (!messagesContainer) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${className}`;
  
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
    .replace(/\n/g, '<br>');

  msgDiv.innerHTML = formatted;
  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

window.toggleAIChat = toggleAIChat;
window.handleChatKey = handleChatKey;
window.sendChatMessage = sendChatMessage;

function promptDashboardApiKey() {
  const current = localStorage.getItem('gemini_api_key') || '';
  const key = prompt("🔑 Configure AI API Key:\nEnter your Google Gemini (starts with AIzaSy) or OpenAI (starts with sk-) API Key to enable live AI chatbot conversations.\n\nDon't have one? You can get a free Gemini Key at: https://aistudio.google.com/\nLeave blank to clear.", current);
  if (key === null) return;
  
  if (key.trim()) {
    localStorage.setItem('gemini_api_key', key.trim());
    alert("API Key saved! Try chatting with the AI bot again.");
  } else {
    localStorage.removeItem('gemini_api_key');
    alert("API Key cleared.");
  }
}
window.promptDashboardApiKey = promptDashboardApiKey;
