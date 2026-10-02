const LAYOUT_TEMPLATE = `
<aside class="sidebar" id="sidebar">
  <div class="brand">
    <span class="brand-logo"></span>
    <span class="brand-name">Edu-Track</span>
    <span class="brand-role">Instructor</span>
  </div>

  <div id="cohortCard"></div>

  <nav class="nav" aria-label="Main">
    <ul class="nav-links">
      <li><a href="dashboard.html" class="link">Dashboard</a></li>
      <li><a href="students.html" class="link">Students</a></li>
      <li><a href="track.html" class="link">Tracking &amp; grades</a></li>
      <li><a href="attendance.html" class="link">Attendance</a></li>
    </ul>
  </nav>

  <footer class="sidebar-footer">
    <div class="user">
      <span class="avatar" id="userAvatar">IN</span>
      <div>
        <p class="user-name" id="userName">Instructor</p>
        <p class="user-role">Lead Instructor</p>
      </div>
    </div>

    <button class="btn btn-outline btn-block" type="button" id="signOutBtn">
      Sign out
    </button>
  </footer>
</aside>

<div class="overlay" id="overlay"></div>

<header class="topbar">
  <div class="topbar-left">
    <button class="burger" id="burgerBtn" type="button" aria-label="Open menu">☰</button>
    <div>
      <p class="topbar-sub" id="topbarSub">Instructor Portal</p>
      <h1 class="topbar-title" id="pageTitle">Dashboard</h1>
    </div>
  </div>

  <div class="topbar-actions">
    <input type="search" class="search" id="topbarSearch" placeholder="Search students by Name or ID..." />

    <div class="theme-toggle">
      <button type="button" data-theme="light">Light</button>
      <button type="button" data-theme="dark">Dark</button>
    </div>

    <button class="btn btn-outline" type="button" aria-label="Notifications" id="notificationBtn">
      <i class="fa-regular fa-bell"></i>
      <span class="badge" id="notificationBadge" hidden>0</span>
    </button>
  </div>
</header>
`;

let layoutPromise = null;

export async function loadLayout() {
  const container = document.getElementById("layout-container");
  if (!container) return;

  try {
    const response = await fetch("./components/layout.html");
    if (!response.ok) {
      throw new Error(`Failed to load layout from components/layout.html (status: ${response.status})`);
    }
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    // Fallback to inline template if fetch fails (e.g. file:/// protocol)
    console.warn("Using inline layout template fallback:", error.message);
    container.innerHTML = LAYOUT_TEMPLATE;
  }

  initLayout();
}

export function getLayout() {
  if (!layoutPromise) {
    layoutPromise = loadLayout();
  }
  return layoutPromise;
}

export function initLayout() {
  initTheme();
  initBurgerMenu();
  initSignOut();
  setActiveNav();
  loadInstructorInfo();
  setPageTitle();
}

function initTheme() {
  const themeButtons = document.querySelectorAll(".theme-toggle button");
  if (themeButtons.length === 0) return;

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    themeButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.theme === theme);
    });

    localStorage.setItem("theme", theme);
  }

  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTheme(btn.dataset.theme);
    });
  });

  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
}

function initBurgerMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const burgerBtn = document.getElementById("burgerBtn");

  if (!sidebar || !overlay || !burgerBtn) return;

  function toggleMenu() {
    sidebar.classList.toggle("is-open");
    overlay.classList.toggle("is-open");
  }

  burgerBtn.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);
}

function initSignOut() {
  const signOutBtn = document.getElementById("signOutBtn");
  if (!signOutBtn) return;

  signOutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentInstructor");
    sessionStorage.removeItem("currentInstructor");
    localStorage.removeItem("instructorId");
    window.location.href = "index.html";
  });
}

function setActiveNav() {
  const rawPage = window.location.pathname.split("/").pop();
  const currentPage = rawPage === "" ? "dashboard.html" : rawPage;
  const links = document.querySelectorAll(".nav-links .link");

  links.forEach((link) => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    }
  });
}

function loadInstructorInfo() {
  let instructor = null;
  try {
    instructor = JSON.parse(localStorage.getItem("currentInstructor")) || JSON.parse(sessionStorage.getItem("currentInstructor"));
  } catch (e) {
    console.warn("Failed to parse currentInstructor from localStorage");
  }

  if (!instructor) {
    window.location.href = "index.html";
    return;
  }

  const userName = document.getElementById("userName");
  const userAvatar = document.getElementById("userAvatar");

  if (instructor && instructor.name) {
    if (userName) userName.textContent = instructor.name;
    if (userAvatar) {
      userAvatar.textContent = instructor.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
  }
}

function setPageTitle() {
  const pageTitle = document.getElementById("pageTitle");
  const topbarSub = document.getElementById("topbarSub");
  const rawPage = window.location.pathname.split("/").pop();
  const currentPage = rawPage === "" ? "dashboard.html" : rawPage;

  const titles = {
    "dashboard.html": "Dashboard",
    "students.html": "Students",
    "track.html": "Tracking & grades",
    "attendance.html": "Attendance"
  };

  if (pageTitle && titles[currentPage]) {
    pageTitle.textContent = titles[currentPage];
  }

  if (topbarSub && currentPage === "dashboard.html") {
    topbarSub.textContent = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
}

// Auto-run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => getLayout());
} else {
  getLayout();
}