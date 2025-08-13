// ===== Utilities =====
const $ = (q, ctx=document) => ctx.querySelector(q);
const $$ = (q, ctx=document) => Array.from(ctx.querySelectorAll(q));

const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Dark Mode =====
const darkToggle = $("#darkModeToggle");
const setTheme = (dark) => {
  document.body.classList.toggle('dark', dark);
  localStorage.setItem('darkMode', dark ? 'true' : 'false');
  if (darkToggle) darkToggle.textContent = dark ? "☀️" : "🌙";
};
setTheme(localStorage.getItem('darkMode') === 'true');
darkToggle?.addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));

// ===== Auth (LocalStorage demo) =====
function getUser(){ try{ return JSON.parse(localStorage.getItem('user')) } catch { return null } }
function setUser(u){ localStorage.setItem('user', JSON.stringify(u)); }
function clearUser(){ localStorage.removeItem('user'); }

function renderAuthUI(){
  const user = getUser();
  const guestNav = $("#guestNav");
  const userNav = $("#userNav");
  const welcome = $("#welcomeUser");
  if (!guestNav || !userNav) return;
  if (user) {
    guestNav.classList.add("hidden");
    userNav.classList.remove("hidden");
    if (welcome) welcome.textContent = `Hi, ${user.name}`;
  } else {
    guestNav.classList.remove("hidden");
    userNav.classList.add("hidden");
  }
}
renderAuthUI();

$("#logoutBtn")?.addEventListener("click", () => { clearUser(); renderAuthUI(); });
