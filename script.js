const themeToggle = document.querySelector("[data-theme-toggle]");
const html = document.documentElement;

// Get saved theme or system preference

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("cal-theme");

  if (savedTheme) {
    return savedTheme;
  }

  // Detect system preference
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "2"; // Light theme
  }

  return "1"; // Dark theme (default)
}

// Apply theme
function setTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("cal-theme", theme);

  // Update toggle UI if needed
  if (themeToggle) {
    themeToggle.value = theme;
  }
}

// Initialize theme
setTheme(getPreferredTheme());

// Theme toggle handler
if (themeToggle) {
  themeToggle.addEventListener("change", (e) => {
    setTheme(e.target.value);
  });
}

// Listen for system theme changes
window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => {
    // Only auto-switch if user hasn't manually selected a theme
    if (!localStorage.getItem("cal-theme")) {
      setTheme(e.matches ? "2" : "1");
    }
  });
