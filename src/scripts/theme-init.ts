import {
  initThemeFromStorage,
  isDarkResolved,
  nextExplicitAfterClick,
  onSystemThemeChange,
  readStoredTheme,
  setTheme,
  THEME_STORAGE_KEY,
} from "../lib/site-theme";

const BTN = "artify-theme-toggle";
const I_LIGHT = "artify-theme-icon-light";
const I_DARK = "artify-theme-icon-dark";

function setIconForResolved(): void {
  const light = document.getElementById(I_LIGHT);
  const drk = document.getElementById(I_DARK);
  const m =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
  const stored = readStoredTheme();
  const isDark = isDarkResolved(stored, m);
  if (light) light.classList.toggle("hidden", isDark);
  if (drk) drk.classList.toggle("hidden", !isDark);
  const btn = document.getElementById(BTN);
  if (btn) {
    const next = nextExplicitAfterClick(stored, m);
    btn.setAttribute(
      "aria-label",
      `Color theme: ${isDark ? "dark" : "light"}. Click to use ${next} theme.`,
    );
  }
}

let controlBound = false;

function init(): void {
  if (controlBound) {
    initThemeFromStorage();
    setIconForResolved();
    return;
  }
  initThemeFromStorage();
  setIconForResolved();
  controlBound = true;
  const btn = document.getElementById(BTN);
  btn?.addEventListener("click", () => {
    const m = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = nextExplicitAfterClick(readStoredTheme(), m);
    setTheme(next);
    setIconForResolved();
  });
  onSystemThemeChange(() => {
    setIconForResolved();
  });
  window.addEventListener("storage", (e) => {
    if (e.key !== THEME_STORAGE_KEY) return;
    initThemeFromStorage();
    setIconForResolved();
  });
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
  document.addEventListener("astro:page-load", init);
}
