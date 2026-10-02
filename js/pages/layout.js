import { getAllStudents } from "../modules/api.js";

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
    <div class="header-search">
      <input type="search" class="search" id="topbarSearch" placeholder="Search students by name or ID..." autocomplete="off" role="combobox" aria-label="Search students" aria-autocomplete="list" aria-expanded="false" aria-controls="topbarSearchResults" />
      <div class="search-dropdown" id="topbarSearchResults" hidden>
        <div class="search-results" role="listbox" aria-label="Matching students"></div>
        <div class="search-status" role="status" aria-live="polite"></div>
      </div>
    </div>

    <div class="theme-toggle">
      <button type="button" data-theme="light">Light</button>
      <button type="button" data-theme="dark">Dark</button>
    </div>

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
  initGlobalStudentSearch();
}

function initGlobalStudentSearch() {
  const searchInput = document.getElementById("topbarSearch");
  const searchDropdown = document.getElementById("topbarSearchResults");
  const searchResults = searchDropdown?.querySelector(".search-results");
  const searchStatus = searchDropdown?.querySelector(".search-status");
  const searchWrapper = searchInput?.closest(".header-search");
  if (!searchInput || !searchDropdown || !searchResults || !searchStatus) return;

  if (window.location.pathname.endsWith("students.html")) {
    searchInput.value = new URLSearchParams(window.location.search).get("search") || "";
  }

  let studentsPromise;
  let matchedStudents = [];
  let activeIndex = -1;
  let requestId = 0;

  function setDropdownOpen(isOpen) {
    searchDropdown.hidden = !isOpen;
    searchInput.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) {
      searchInput.removeAttribute("aria-activedescendant");
      activeIndex = -1;
    }
  }

  function setActiveOption(options, index) {
    activeIndex = index;
    options.forEach((option, optionIndex) => {
      const isActive = optionIndex === activeIndex;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-selected", String(isActive));
    });

    const activeOption = options[activeIndex];
    if (activeOption) {
      searchInput.setAttribute("aria-activedescendant", activeOption.id);
    } else {
      searchInput.removeAttribute("aria-activedescendant");
    }
  }

  function openStudentProfile(student) {
    window.location.href = `student-profile.html?id=${encodeURIComponent(student.id)}`;
  }

  function renderStudents(matches) {
    searchResults.replaceChildren();
    matchedStudents = matches.slice(0, 8);
    activeIndex = -1;

    matchedStudents.forEach((student, index) => {
      const option = document.createElement("button");
      const name = document.createElement("span");
      const details = document.createElement("span");

      option.type = "button";
      option.className = "search-result";
      option.id = `topbar-search-option-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      name.className = "search-result-name";
      name.textContent = student.name || "Unnamed student";
      details.className = "search-result-details";
      details.textContent = [student.email, `ID: ${student.id}`].filter(Boolean).join(" | ");

      option.append(name, details);
      option.addEventListener("click", () => openStudentProfile(student));
      searchResults.appendChild(option);
    });

    searchStatus.textContent = matches.length === 0 ? "No students found" : "";
    setDropdownOpen(true);
  }

  async function searchStudents() {
    const currentRequest = ++requestId;
    const query = searchInput.value.trim().toLowerCase();
    searchResults.replaceChildren();
    activeIndex = -1;

    if (!query) {
      searchStatus.textContent = "";
      setDropdownOpen(false);
      return;
    }

    searchStatus.textContent = "Searching...";
    setDropdownOpen(true);

    try {
      if (!studentsPromise) {
        let instructor = null;
        try {
          instructor = JSON.parse(localStorage.getItem("currentInstructor"))
            || JSON.parse(sessionStorage.getItem("currentInstructor"));
        } catch (error) {
          instructor = null;
        }

        if (!instructor?.id) throw new Error("No signed-in instructor");
        studentsPromise = getAllStudents(instructor.id);
      }

      const students = await studentsPromise;
      if (currentRequest !== requestId) return;

      const matches = students.filter((student) => {
        const searchableText = `${student.name || ""} ${student.email || ""} ${student.id || ""}`.toLowerCase();
        return searchableText.includes(query);
      });

      renderStudents(matches);
    } catch (error) {
      studentsPromise = null;
      if (currentRequest !== requestId) return;
      searchResults.replaceChildren();
      searchStatus.textContent = "Could not load students";
      setDropdownOpen(true);
      console.error(error);
    }
  }

  searchInput.addEventListener("input", searchStudents);
  searchInput.addEventListener("keydown", (event) => {
    const options = [...searchResults.querySelectorAll('[role="option"]')];

    if (event.key === "ArrowDown" && options.length > 0) {
      event.preventDefault();
      setActiveOption(options, Math.min(activeIndex + 1, options.length - 1));
    } else if (event.key === "ArrowUp" && options.length > 0) {
      event.preventDefault();
      setActiveOption(options, Math.max(activeIndex - 1, 0));
    } else if (event.key === "Escape") {
      setDropdownOpen(false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (options.length > 0) {
        openStudentProfile(matchedStudents[activeIndex >= 0 ? activeIndex : 0]);
      } else {
        const query = searchInput.value.trim();
        if (query) window.location.href = `students.html?search=${encodeURIComponent(query)}`;
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (!searchWrapper?.contains(event.target)) setDropdownOpen(false);
  });

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