/* ========================================
   PlacementOS — app.js
======================================== */

// ── STATE ──
const S = {
  dsa: [], projects: [], applications: [],
  hours: {}, dailyChecks: {}, placementChecks: {},
  skills: {}, subjects: {},
  streak: 0, lastActive: null,
  xp: 0, level: 1,
  mocks: 0, apps: 0,
  weekHours: {}
};

// ── LOAD ──
function load() {
  const saved = localStorage.getItem('placementOS_v2');
  if (saved) Object.assign(S, JSON.parse(saved));
  initStreakCheck();
}

function save() {
  localStorage.setItem('placementOS_v2', JSON.stringify(S));
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

const DSA_CATS = ['Arrays', 'Strings', 'Trees', 'Graphs', 'DP', 'Sorting', 'Linked List', 'Binary Search', 'Stack/Queue', 'Greedy'];
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
});

function renderAll() {
  renderDashboard();
  renderDSASection();
  renderSubjects();
  renderCommSkills();
  renderSoftSkills();
  renderProjects();
  renderPlacement();
  renderAnalytics();
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
  const titles = { dashboard: 'Dashboard', dsa: 'DSA Tracker', subjects: 'Core Subjects', communication: 'Communication', softskills: 'Soft Skills', projects: 'Projects', placement: 'Placement Tracker', analytics: 'Analytics' };
  document.getElementById('topbar-title').textContent = titles[sec] || sec;
  if (sec === 'analytics') renderAnalytics();
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
  ring.style.strokeDashoffset = circ - (pct / 100 * circ);

  // Hours
  const todayH = S.hours[TODAY_KEY] || 0;
  const weekH = getWeekHours();
  document.getElementById('hours-today').textContent = todayH + 'h';
  document.getElementById('hours-week').textContent = weekH + 'h';
  document.getElementById('hours-total').textContent = totalHours() + 'h';

  // Daily checklist
  restoreCheckboxes('daily-checklist', S.dailyChecks, 'data-key');
  updateDailyPct();

  // Badges
  renderBadges();

  // Week grid
  renderWeekGrid();

  // Sidebar XP
  updateXPBar();
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
  const keys = ['daily-dsa', 'daily-subject', 'daily-project', 'daily-mock', 'daily-reading'];
  const done = keys.filter(k => S.dailyChecks[k]).length;
  document.getElementById('daily-pct-label').textContent = `${done} / 5 done`;
  document.getElementById('daily-fill').style.width = (done / 5 * 100) + '%';
}

function toggleDaily(cb) {
  S.dailyChecks[cb.dataset.key] = cb.checked;
  if (cb.checked) addXP(5);
  updateDailyPct();
  save();
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

// ── HOURS ──
function logHours() {
  const v = parseFloat(document.getElementById('hours-input').value);
  if (!v || v <= 0) return toast('Enter valid hours', 'error');
  S.hours[TODAY_KEY] = (S.hours[TODAY_KEY] || 0) + v;
  document.getElementById('hours-input').value = '';
  addXP(Math.floor(v * 10));
  save();
  renderDashboard();
  toast(`✅ ${v}h logged — keep grinding!`);
}

// ── DSA ──
function addProblem() {
  const name = document.getElementById('prob-name').value.trim();
  if (!name) return toast('Enter problem title', 'error');
  const prob = {
    id: Date.now(), name,
    cat: document.getElementById('prob-cat').value,
    diff: document.getElementById('prob-diff').value,
    link: document.getElementById('prob-link').value.trim(),
    date: TODAY_KEY
  };
  S.dsa.push(prob);
  document.getElementById('prob-name').value = '';
  document.getElementById('prob-link').value = '';
  addXP(prob.diff === 'Easy' ? 10 : prob.diff === 'Medium' ? 20 : 35);
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

  const msgs = ['Start strong — solve your first problem!', 'Great start! Keep going!', 'Halfway there!', 'Almost done!', 'One more for the target!', '🔥 Target crushed! Bonus round?'];
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
function renderSubjects() {
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
          ${SUBJECTS_DATA[sub].map(topic => `
            <label class="topic-item">
              <input type="checkbox" ${S.subjects[sub][topic] ? 'checked' : ''} onchange="toggleTopic('${sub}','${topic}',this)">
              <span>${topic}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function toggleTopic(sub, topic, cb) {
  if (!S.subjects[sub]) S.subjects[sub] = {};
  S.subjects[sub][topic] = cb.checked;
  if (cb.checked) addXP(8);
  save();
  renderSubjects();
  renderDashboard();
}

// ── COMMUNICATION & SOFT SKILLS ──
function renderCommSkills() {
  renderSkillTrackers('comm-trackers', COMM_SKILLS, 'comm');
}

function renderSoftSkills() {
  renderSkillTrackers('soft-trackers', SOFT_SKILLS, 'soft');
}

function renderSkillTrackers(containerId, skills, prefix) {
  const container = document.getElementById(containerId);
  container.innerHTML = skills.map(skill => {
    const key = `${prefix}_${skill}`;
    const val = S.skills[key] || 0;
    const levels = ['Beginner', 'Learning', 'Practicing', 'Proficient', 'Expert'];
    return `
      <div class="skill-card">
        <div class="skill-card-header">
          <span class="skill-card-title">${skill}</span>
          <span class="skill-rating">${levels[val] || 'Beginner'}</span>
        </div>
        <div class="prog-bar" style="margin-bottom:12px">
          <div class="prog-fill" style="width:${val * 25}%"></div>
        </div>
        <div class="skill-level-btns">
          ${levels.map((l, i) => `<button class="level-btn ${val === i ? 'active' : ''}" onclick="setSkill('${key}', ${i})">${l}</button>`).join('')}
        </div>
        <textarea class="skill-notes" rows="2" placeholder="Notes..." onchange="setSkillNote('${key}', this.value)">${S.skills[key + '_note'] || ''}</textarea>
      </div>
    `;
  }).join('');
}

function setSkill(key, val) {
  const prev = S.skills[key] || 0;
  S.skills[key] = val;
  if (val > prev) addXP(5);
  save();
  renderCommSkills();
  renderSoftSkills();
}

function setSkillNote(key, val) {
  S.skills[key + '_note'] = val;
  save();
}

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
}

function restoreCheckboxes(selector, store, attr) {
  document.querySelectorAll(`${selector} input[${attr}]`).forEach(cb => {
    cb.checked = !!store[cb.getAttribute(attr)];
  });
}

function togglePlacement(cb) {
  S.placementChecks[cb.dataset.key] = cb.checked;
  if (cb.checked) addXP(10);
  save();
  renderDashboard();
}

function changeMock(delta) {
  S.mocks = Math.max(0, S.mocks + delta);
  if (delta > 0) addXP(15);
  document.getElementById('mock-count').textContent = S.mocks;
  updateMockBar();
  save();
  renderDashboard();
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
