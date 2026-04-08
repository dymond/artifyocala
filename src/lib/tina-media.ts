export function normalizeTinaRepoMediaSrc(raw: string): string {
  const v = (raw ?? "").trim();
  if (!v) return v;

  // Tina media CDN mirrors repo files but returns assets.tina.io URLs.
  // When possible, rewrite to the repo-served path so production uses the site's domain.
  if (v.startsWith("https://assets.tina.io/") || v.startsWith("http://assets.tina.io/")) {
    try {
      const u = new URL(v);
      const p = u.pathname || "";
      const idx = p.indexOf("/images/");
      if (idx !== -1) return p.slice(idx);
    } catch {
      // fall through
    }
  }

  return v;
}

