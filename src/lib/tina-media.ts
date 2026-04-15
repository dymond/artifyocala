const tinaAssetHosts = new Set([
  "assets.tina.io",
  "assets.tinajs.io",
]);

function rewriteTinaAssetCdnUrl(v: string): string | null {
  try {
    const u = new URL(v);
    if (!tinaAssetHosts.has(u.hostname)) return null;
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
    return null;
  }
  return null;
}

export function normalizeTinaRepoMediaSrc(raw: string): string {
  const v = (raw ?? "").trim();
  if (!v) return v;

  // Tina media CDNs mirror repo files but return absolute URLs.
  // When possible, rewrite to the repo-served path so production uses the site's domain.
  const rewritten = rewriteTinaAssetCdnUrl(v);
  if (rewritten) return rewritten;

  return v;
}

