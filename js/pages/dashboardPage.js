// ===== Theme (Light / Dark) =====
const themeButtons = document.querySelectorAll(".theme-toggle button");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  themeButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.theme === theme);
  });

  localStorage.setItem("theme", theme);
}

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setTheme(btn.dataset.theme));
});

setTheme(localStorage.getItem("theme") || "light");

// ===== Burger menu =====
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const burgerBtn = document.getElementById("burgerBtn");

function toggleMenu() {
  sidebar.classList.toggle("is-open");
  overlay.classList.toggle("is-open");
}

burgerBtn.addEventListener("click", toggleMenu);
overlay.addEventListener("click", toggleMenu);

