// Theme toggle -- intercept form submit, toggle client-side, POST for cookie
document.addEventListener("submit", function (e) {
  var form = e.target;
  if (!form.classList || !form.classList.contains("theme-toggle")) return;
  e.preventDefault();

  var root = document.documentElement;
  var isDark = root.classList.contains("theme-dark");
  var newTheme = isDark ? "light" : "dark";

  // Toggle root class
  root.classList.toggle("theme-dark");

  // Persist to localStorage
  localStorage.setItem("holler-theme", newTheme);

  // Update form for no-JS fallback correctness
  var nextTheme = newTheme === "dark" ? "light" : "dark";
  var input = form.querySelector('input[name="theme"]');
  if (input) input.value = nextTheme;
  form.setAttribute("action", "/_theme?theme=" + nextTheme);

  // Update aria-label
  var btn = form.querySelector(".theme-switch");
  if (btn) btn.setAttribute("aria-label", "Switch to " + nextTheme + " mode");

  // Set cookie server-side (fire and forget)
  fetch("/_theme?theme=" + newTheme, { method: "POST" });
});
