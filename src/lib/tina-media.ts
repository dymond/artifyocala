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

      // Some Tina URLs omit the /images/ segment (older uploads / different mediaRoot).
      // In this project we want repo-served images under /images/<filename>.
      const parts = p.split("/").filter(Boolean);
      const last = parts[parts.length - 1] ?? "";
      if (/\.(avif|webp|png|jpe?g|gif)$/i.test(last)) {
        return `/images/${last}`;
      }
    } catch {
      // fall through
    }
  }

  return v;
}

