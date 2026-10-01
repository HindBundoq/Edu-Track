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

