/* ========= Storage Keys ========= */
const KEYS = {
  USERS: 'll_users',
  SESSION: 'll_session',
  ENROLL: 'll_enrollments',
  THEME: 'll_theme'
};

/* ========= Helpers ========= */
const read = (k, d=null) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
  catch { return d; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = () => Math.random().toString(36).slice(2,10);

/* ========= Demo Catalog ========= */
const CATALOG = [
  {
    id: 'html101',
    title: 'HTML for Beginners',
    level: 'Beginner',
    tags: ['web', 'frontend', 'markup'],
    cover: 'linear-gradient(135deg,#7c9cff,#9bb6ff)',
    description: 'Learn the building blocks of the web: tags, structure, and semantic HTML. No prior experience required.',
    lessons: [
      'What is HTML?',
      'Your first page',
      'Headings & paragraphs',
      'Links & images',
      'Semantic layout',
      'Forms 101'
    ]
  },
  {
    id: 'css101',
    title: 'Modern CSS Layouts',
    level: 'Intermediate',
    tags: ['css', 'flexbox', 'grid'],
    cover: 'linear-gradient(135deg,#ffb86b,#ffd19f)',
    description: 'Master Flexbox and Grid to craft responsive, accessible layouts.',
    lessons: [
      'Cascade & selectors refresher',
      'Flexbox fundamentals',
      'Grid basics',
      'Responsive techniques',
      'Fluid type & spacing',
      'Polish & accessibility'
    ]
  },
  {
    id: 'js101',
    title: 'Practical JavaScript',
    level: 'Beginner',
    tags: ['javascript', 'dom', 'programming'],
    cover: 'linear-gradient(135deg,#61d6a3,#77e0b5)',
    description: 'From variables to DOM manipulation — build interactive pages with vanilla JS.',
    lessons: [
      'Syntax & variables',
      'Control flow',
      'Functions & scope',
      'Arrays & objects',
      'DOM & events',
      'LocalStorage mini-project'
    ]
  },
  {
    id: 'a11y201',
    title: 'Web Accessibility Essentials',
    level: 'Advanced',
    tags: ['a11y', 'wcag', 'inclusive'],
    cover: 'linear-gradient(135deg,#ff6b81,#ffa0ae)',
    description: 'Design and code for everyone. Learn WCAG, ARIA, keyboard nav, and testing tips.',
    lessons: [
      'Why accessibility matters',
      'Perceivable: text alternatives',
      'Operable: keyboard & focus',
      'Understandable: forms & content',
      'Robust: ARIA & semantics',
      'Auditing & tooling'
    ]
  }
];

/* ========= App State ========= */
let users = read(KEYS.USERS, {});           // { [email]: { id, name, email, password } }
let session = read(KEYS.SESSION, null);     // { email }
let enrollments = read(KEYS.ENROLL, {});    // { [email]: { [courseId]: { completed: boolean[], enrolledAt:number } } }

/* ========= DOM ========= */
const authGate = document.getElementById('authGate');
const appViews = document.getElementById('appViews');
const welcomeLabel = document.getElementById('welcomeLabel');
const logoutBtn = document.getElementById('logoutBtn');
const yearEl = document.getElementById('year');
const themeToggle = document.getElementById('themeToggle');

const tabCourses = document.getElementById('tab-courses');
const tabDashboard = document.getElementById('tab-dashboard');
const tabAccount = document.getElementById('tab-account');
const viewCourses = document.getElementById('view-courses');
const viewDashboard = document.getElementById('view-dashboard');
const viewAccount = document.getElementById('view-account');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const searchInput = document.getElementById('searchInput');
const levelFilter = document.getElementById('levelFilter');
const clearFilters = document.getElementById('clearFilters');
const coursesGrid = document.getElementById('coursesGrid');
const courseCount = document.getElementById('courseCount');

const dashboardGrid = document.getElementById('dashboardGrid');
const emptyDash = document.getElementById('emptyDash');

const accountSummary = document.getElementById('accountSummary');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const wipeBtn = document.getElementById('wipeBtn');

/* Modal */
const courseModal = document.getElementById('courseModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalLevel = document.getElementById('modalLevel');
const modalLessonsCount = document.getElementById('modalLessonsCount');
const modalTags = document.getElementById('modalTags');
const modalCover = document.getElementById('modalCover');
const lessonsList = document.getElementById('lessonsList');
const modalProgressBar = document.getElementById('modalProgressBar');
const modalProgressLabel = document.getElementById('modalProgressLabel');
const enrollBtn = document.getElementById('enrollBtn');
const unenrollBtn = document.getElementById('unenrollBtn');
const markAllBtn = document.getElementById('markAllBtn');
const resetProgressBtn = document.getElementById('resetProgressBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

/* ========= Theme ========= */
function applyTheme() {
  const saved = localStorage.getItem(KEYS.THEME);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : 'light'); // default is dark tokens
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  if(next === 'light') document.documentElement.setAttribute('data-theme','light');
  else document.documentElement.setAttribute('data-theme','');
  localStorage.setItem(KEYS.THEME, next);
}
themeToggle.addEventListener('click', toggleTheme);

/* ========= Utilities ========= */
function setSession(email){ session = email ? { email } : null; write(KEYS.SESSION, session); }
function currentUser(){ return session ? users[session.email] : null; }
function ensureEnrollment(email){ if(!enrollments[email]) enrollments[email] = {}; }
function getCourse(id){ return CATALOG.find(c=>c.id===id); }
function enrolled(email, courseId){ return !!(enrollments[email] && enrollments[email][courseId]); }
function enrollmentOf(email, courseId){
  ensureEnrollment(email);
  if(!enrollments[email][courseId]) {
    const course = getCourse(courseId);
    enrollments[email][courseId] = { completed: Array(course.lessons.length).fill(false), enrolledAt: Date.now() };
    write(KEYS.ENROLL, enrollments);
  }
  return enrollments[email][courseId];
}
function progressFor(email, courseId){
  if(!enrolled(email, courseId)) return 0;
  const { completed } = enrollmentOf(email, courseId);
  const done = completed.filter(Boolean).length;
  return Math.round((done / completed.length) * 100);
}

/* ========= Rendering ========= */
function renderAuthGate(){
  const user = currentUser();
  if(user){
    authGate.classList.add('hidden');
    appViews.classList.remove('hidden');
    welcomeLabel.textContent = `Hi, ${user.name}`;
    logoutBtn.classList.remove('hidden');
    selectTab('courses');
  } else {
    authGate.classList.remove('hidden');
    appViews.classList.add('hidden');
    welcomeLabel.textContent = '';
    logoutBtn.classList.add('hidden');
  }
  yearEl.textContent = new Date().getFullYear();
}

function renderCourses(){
  courseCount.textContent = String(CATALOG.length);
  const q = (searchInput.value || '').trim().toLowerCase();
  const lvl = levelFilter.value;

  const results = CATALOG.filter(c => {
    const matchesLvl = !lvl || c.level === lvl;
    const hay = (c.title + ' ' + c.description + ' ' + c.tags.join(' ')).toLowerCase();
    const matchesQ = !q || hay.includes(q);
    return matchesLvl && matchesQ;
  });

  const email = currentUser()?.email;
  coursesGrid.innerHTML = '';
  results.forEach(course => {
    const card = document.createElement('div');
    card.className = 'course-card';

    const pct = email ? progressFor(email, course.id) : 0;
    const isEnrolled = email ? enrolled(email, course.id) : false;

    const cover = document.createElement('div');
    cover.className = 'course-cover';
    cover.style.background = course.cover;

    const body = document.createElement('div');
    body.className = 'course-body';
    body.innerHTML = `
      <div class="course-meta">
        <h3 style="margin:0">${course.title}</h3>
        <span class="tag">${course.level}</span>
      </div>
      <p class="muted" style="margin:0">${course.description}</p>
      <div class="tags">${course.tags.map(t=>`<span class="tag">#${t}</span>`).join('')}</div>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="course-meta">
        <button class="btn primary" data-open="${course.id}">${isEnrolled ? 'Open' : 'View details'}</button>
        <span class="small muted">${isEnrolled ? `${pct}%` : `${course.lessons.length} lessons`}</span>
      </div>
    `;
    card.appendChild(cover);
    card.appendChild(body);
    coursesGrid.appendChild(card);
  });
}

function renderDashboard(){
  const email = currentUser()?.email;
  dashboardGrid.innerHTML = '';
  if(!email || !enrollments[email] || Object.keys(enrollments[email]).length === 0){
    emptyDash.classList.remove('hidden');
    return;
  }
  emptyDash.classList.add('hidden');
  Object.keys(enrollments[email]).forEach(courseId => {
    const course = getCourse(courseId);
    if(!course) return;
    const pct = progressFor(email, courseId);

    const card = document.createElement('div');
    card.className = 'course-card';
    const cover = document.createElement('div');
    cover.className = 'course-cover';
    cover.style.background = course.cover;

    const body = document.createElement('div');
    body.className = 'course-body';
    body.innerHTML = `
      <div class="course-meta">
        <h3 style="margin:0">${course.title}</h3>
        <span class="tag">${course.level}</span>
      </div>
      <p class="muted small" style="margin:0">${course.description}</p>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="course-meta">
        <button class="btn primary" data-open="${course.id}">Open</button>
        <span class="small muted">${pct}%</span>
      </div>
    `;
    card.appendChild(cover);
    card.appendChild(body);
    dashboardGrid.appendChild(card);
  });
}

function renderAccount(){
  const user = currentUser();
  const email = user?.email || '—';
  const totalEnroll = user && enrollments[user.email] ? Object.keys(enrollments[user.email]).length : 0;
  accountSummary.innerHTML = `
    <span class="tag"><strong>Name:</strong>&nbsp;${user?.name || '—'}</span>
    <span class="tag"><strong>Email:</strong>&nbsp;${email}</span>
    <span class="tag"><strong>Enrollments:</strong>&nbsp;${totalEnroll}</span>
  `;
}

/* ========= Modal ========= */
let activeCourseId = null;

function openCourseModal(courseId){
  activeCourseId = courseId;
  const course = getCourse(courseId);
  const email = currentUser().email;
  const isEnrolled = enrolled(email, courseId);
  const enr = isEnrolled ? enrollmentOf(email, courseId) : null;

  modalTitle.textContent = course.title;
  modalDesc.textContent = course.description;
  modalLevel.textContent = course.level;
  modalLessonsCount.textContent = `${course.lessons.length} lessons`;
  modalTags.textContent = course.tags.map(t=>`#${t}`).join(' ');
  modalCover.style.background = course.cover;

  lessonsList.innerHTML = '';
  const completed = isEnrolled ? enr.completed : Array(course.lessons.length).fill(false);
  course.lessons.forEach((title, i) => {
    const id = `lsn-${courseId}-${i}`;
    const li = document.createElement('li');
    li.innerHTML = `
      <label for="${id}">
        <input id="${id}" type="checkbox" ${completed[i] ? 'checked' : ''} ${!isEnrolled ? 'disabled' : ''} data-lesson-index="${i}" />
        <span>${title}</span>
      </label>
    `;
    lessonsList.appendChild(li);
  });

  updateModalProgress();

  enrollBtn.classList.toggle('hidden', isEnrolled);
  unenrollBtn.classList.toggle('hidden', !isEnrolled);
  markAllBtn.disabled = !isEnrolled;
  resetProgressBtn.disabled = !isEnrolled;

  if(typeof courseModal.showModal === 'function') courseModal.showModal();
  else courseModal.setAttribute('open','');
}
function closeCourseModal(){ activeCourseId=null; if(courseModal.open) courseModal.close(); }

function updateModalProgress(){
  const email = currentUser().email;
  const pct = progressFor(email, activeCourseId);
  modalProgressBar.style.width = pct + '%';
  modalProgressLabel.textContent = pct + '%';
}

/* ========= Events ========= */
// Tabs
function selectTab(name){
  const maps = {
    courses: [tabCourses, viewCourses],
    dashboard: [tabDashboard, viewDashboard],
    account: [tabAccount, viewAccount]
  };
  Object.entries(maps).forEach(([key, [tab, view]]) => {
    const selected = key === name;
    tab.setAttribute('aria-selected', selected);
    view.classList.toggle('hidden', !selected);
  });
  if(name === 'courses') renderCourses();
  if(name === 'dashboard') renderDashboard();
  if(name === 'account') renderAccount();
}
tabCourses.addEventListener('click', ()=>selectTab('courses'));
tabDashboard.addEventListener('click', ()=>selectTab('dashboard'));
tabAccount.addEventListener('click', ()=>selectTab('account'));

// Auth
loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = loginForm.email.value.trim().toLowerCase();
  const password = loginForm.password.value;
  const user = users[email];
  if(!user || user.password !== password) { alert('Invalid email or password'); return; }
  setSession(email);
  renderAuthGate(); renderCourses();
});
registerForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = registerForm.name.value.trim();
  const email = registerForm.email.value.trim().toLowerCase();
  const password = registerForm.password.value;
  if(users[email]) { alert('An account with this email already exists.'); return; }
  users[email] = { id: uid(), name, email, password };
  write(KEYS.USERS, users);
  setSession(email);
  renderAuthGate(); renderCourses();
});
logoutBtn.addEventListener('click', ()=>{ setSession(null); renderAuthGate(); });

// Search/filter
searchInput.addEventListener('input', renderCourses);
levelFilter.addEventListener('change', renderCourses);
clearFilters.addEventListener('click', ()=>{ searchInput.value=''; levelFilter.value=''; renderCourses(); });

// Ctrl/Cmd + K focus search
window.addEventListener('keydown', (e)=>{
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){
    e.preventDefault();
    if(authGate.classList.contains('hidden')) searchInput.focus();
  }
});

// Open course from grids
[coursesGrid, dashboardGrid].forEach(grid=>{
  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-open]');
    if(!btn) return;
    openCourseModal(btn.getAttribute('data-open'));
  });
});

// Modal actions
document.getElementById('closeModalBtn').addEventListener('click', closeCourseModal);
enrollBtn.addEventListener('click', ()=>{
  const email = currentUser().email;
  enrollmentOf(email, activeCourseId); // ensure
  write(KEYS.ENROLL, enrollments);
  renderCourses(); renderDashboard(); openCourseModal(activeCourseId);
});
unenrollBtn.addEventListener('click', ()=>{
  const email = currentUser().email;
  if(enrollments[email]) delete enrollments[email][activeCourseId];
  write(KEYS.ENROLL, enrollments);
  renderCourses(); renderDashboard(); closeCourseModal();
});
lessonsList.addEventListener('change', (e)=>{
  const box = e.target;
  if(!box.matches('input[type="checkbox"][data-lesson-index]')) return;
  const idx = Number(box.getAttribute('data-lesson-index'));
  const email = currentUser().email;
  const enr = enrollmentOf(email, activeCourseId);
  enr.completed[idx] = box.checked;
  write(KEYS.ENROLL, enrollments);
  updateModalProgress();
  renderCourses(); renderDashboard();
});
markAllBtn.addEventListener('click', ()=>{
  const email = currentUser().email;
  const enr = enrollmentOf(email, activeCourseId);
  enr.completed = enr.completed.map(()=>true);
  write(KEYS.ENROLL, enrollments);
  openCourseModal(activeCourseId); renderCourses(); renderDashboard();
});
resetProgressBtn.addEventListener('click', ()=>{
  const email = currentUser().email;
  const enr = enrollmentOf(email, activeCourseId);
  enr.completed = enr.completed.map(()=>false);
  write(KEYS.ENROLL, enrollments);
  openCourseModal(activeCourseId); renderCourses(); renderDashboard();
});

/* Account actions */
exportBtn.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify({ users, enrollments, session }, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'litlearn-data.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});
importBtn.addEventListener('click', ()=>importFile.click());
importFile.addEventListener('change', async ()=>{
  const file = importFile.files[0]; if(!file) return;
  try{
    const data = JSON.parse(await file.text());
    if(data.users && data.enrollments){
      users = data.users; enrollments = data.enrollments; session = data.session || null;
      write(KEYS.USERS, users); write(KEYS.ENROLL, enrollments); write(KEYS.SESSION, session);
      renderAuthGate(); renderCourses(); renderDashboard(); renderAccount();
      alert('Import successful.');
    } else { alert('Invalid data format.'); }
  } catch(err){ alert('Failed to import: ' + err.message); }
  finally { importFile.value = ''; }
});
wipeBtn.addEventListener('click', ()=>{
  if(!confirm('Remove all LiteLearn data from this browser?')) return;
  [KEYS.USERS,KEYS.ENROLL,KEYS.SESSION].forEach(k=>localStorage.removeItem(k));
  users = {}; enrollments = {}; session = null;
  renderAuthGate(); renderCourses(); renderDashboard(); renderAccount();
  alert('Data cleared.');
});

/* ========= Init ========= */
function init(){
  applyTheme();
  renderAuthGate();
  renderCourses();
}
init();
