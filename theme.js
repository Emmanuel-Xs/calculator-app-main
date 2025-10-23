const themeRadioInputs = document.querySelectorAll('input[name="theme"]');
const html = document.documentElement;
const STORAGE_KEY = "cal-theme";

/** Syncs the radio button state with the current theme. */
function syncRadioButton(theme) {
  const targetInput = document.getElementById(`theme${theme}`);
  if (targetInput) {
    targetInput.checked = true;
  }
}

/**
 * Applies the given theme to the document, updates localStorage,
 * and syncs the radio button state.
 * @param {string} theme The theme to set ("1", "2", or "3").
 */
function setTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);

  syncRadioButton(theme);
}

/**
 * Sets up all theme-related event listeners and initial state.
 */
export function initializeTheme() {
  // On initial load, ensure the correct radio button is checked.
  const initialTheme = html.getAttribute("data-theme") || "1";
  syncRadioButton(initialTheme);

  // Add listeners to radio buttons for manual theme changes
  themeRadioInputs.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.checked) {
        setTheme(e.target.value);
      }
    });
  });

  // Add listener for system theme changes
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", (e) => {
      const currentTheme = localStorage.getItem(STORAGE_KEY) || "1";
      if (currentTheme === "1" || currentTheme === "2") {
        setTheme(e.matches ? "2" : "1");
      }
    });
}
