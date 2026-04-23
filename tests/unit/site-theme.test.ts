// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  isDarkResolved,
  nextExplicitAfterClick,
  parseStoredTheme,
  readStoredTheme,
  THEME_STORAGE_KEY,
  writeStoredTheme,
  type ThemePreference,
} from "../../src/lib/site-theme";

function permute(p: ThemePreference, prefersDark: boolean): boolean {
  return isDarkResolved(p, prefersDark);
}

describe("site-theme", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("readStoredTheme is system with no key (follow OS; nothing persisted)", () => {
    expect(readStoredTheme()).toBe("system");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it("persists and reads light and dark; invalid value clears to system", () => {
    writeStoredTheme("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(readStoredTheme()).toBe("light");
    writeStoredTheme("dark");
    expect(readStoredTheme()).toBe("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "nope");
    expect(readStoredTheme()).toBe("system");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it("treats missing or invalid values as system", () => {
    expect(parseStoredTheme(null)).toBe("system");
    expect(parseStoredTheme("")).toBe("system");
    expect(parseStoredTheme("   ")).toBe("system");
    expect(parseStoredTheme("nope" as any)).toBe("system");
  });

  it("parses light and dark from static strings", () => {
    expect(parseStoredTheme("light")).toBe("light");
    expect(parseStoredTheme("dark")).toBe("dark");
    expect(parseStoredTheme("system")).toBe("system");
  });

  it("resolves light and dark regardless of system preference", () => {
    expect(permute("light", true)).toBe(false);
    expect(permute("light", false)).toBe(false);
    expect(permute("dark", true)).toBe(true);
    expect(permute("dark", false)).toBe(true);
  });

  it("uses prefers-color-scheme in system mode", () => {
    expect(permute("system", true)).toBe(true);
    expect(permute("system", false)).toBe(false);
  });

  it("nextExplicitAfterClick toggles when key is set", () => {
    expect(nextExplicitAfterClick("light", false)).toBe("dark");
    expect(nextExplicitAfterClick("dark", true)).toBe("light");
  });

  it("nextExplicitAfterClick inverts OS appearance when no key (system)", () => {
    expect(nextExplicitAfterClick("system", false)).toBe("dark");
    expect(nextExplicitAfterClick("system", true)).toBe("light");
  });
});
