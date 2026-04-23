/** localStorage: only `light` or `dark` after the user has chosen. Missing = follow OS. */
export const THEME_STORAGE_KEY = "artify-theme";

export type ThemePreference = "light" | "dark" | "system";

const VALID: ThemePreference[] = ["light", "dark", "system"];

export function parseStoredTheme(raw: string | null | undefined): ThemePreference {
  if (raw == null) return "system";
  const t = String(raw).trim() as ThemePreference;
  if (VALID.includes(t)) return t;
  return "system";
}

/** Whether `document.documentElement` should have the `dark` class. */
export function isDarkResolved(
  preference: ThemePreference,
  prefersColorSchemeDark: boolean,
): boolean {
  if (preference === "light") return false;
  if (preference === "dark") return true;
  return prefersColorSchemeDark;
}

/**
 * Unset key = follow `prefers-color-scheme`. First user click picks the *other* of the
 * current appearance; then we only ever toggle between light and dark (both persisted).
 */
export function nextExplicitAfterClick(
  stored: ThemePreference,
  prefersColorSchemeDark: boolean,
): "light" | "dark" {
  if (stored === "light") return "dark";
  if (stored === "dark") return "light";
  return isDarkResolved("system", prefersColorSchemeDark) ? "light" : "dark";
}

/**
 * `system` in return value = no key; follow `prefers-color-scheme` only.
 * Legacy / invalid / `"system"` in storage is cleared to match “no key”.
 */
export function readStoredTheme(): ThemePreference {
  if (typeof localStorage === "undefined") return "system";
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw == null) return "system";
    const t = String(raw).trim() as ThemePreference;
    if (t === "light" || t === "dark") return t;
    localStorage.removeItem(THEME_STORAGE_KEY);
    return "system";
  } catch {
    return "system";
  }
}

export function writeStoredTheme(preference: "light" | "dark"): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* ignore */
  }
}

/**
 * Call after preference change or for cross-tab / system sync.
 */
export function applyRootTheme(
  preference: ThemePreference,
  prefersColorSchemeDark: boolean,
): void {
  if (typeof document === "undefined") return;
  const dark = isDarkResolved(preference, prefersColorSchemeDark);
  document.documentElement.classList.toggle("dark", dark);
}

export function setTheme(preference: "light" | "dark"): void {
  writeStoredTheme(preference);
  if (typeof window === "undefined") return;
  const m = window.matchMedia("(prefers-color-scheme: dark)");
  applyRootTheme(preference, m.matches);
  syncMetaThemeColor(isDarkResolved(preference, m.matches));
}

function syncMetaThemeColor(isDark: boolean): void {
  const el = document.getElementById("artify-theme-color");
  if (!el || el.tagName.toLowerCase() !== "meta") return;
  el.setAttribute("content", isDark ? "#1b1b38" : "#f4f5fc");
}

export function initThemeFromStorage(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const pref = readStoredTheme();
  const m = window.matchMedia("(prefers-color-scheme: dark)");
  applyRootTheme(pref, m.matches);
  syncMetaThemeColor(isDarkResolved(pref, m.matches));
  return pref;
}

export function onSystemThemeChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const m = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = (): void => {
    const p = readStoredTheme();
    if (p === "light" || p === "dark") return;
    applyRootTheme("system", m.matches);
    syncMetaThemeColor(m.matches);
    handler();
  };
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}
