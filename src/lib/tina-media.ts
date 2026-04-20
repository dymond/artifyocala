const tinaAssetHosts = new Set([
  "assets.tina.io",
  "assets.tinajs.io",
]);

/** Tina sometimes stores `images/foo.jpg` (no leading slash) for mediaRoot `images`. */
function ensureRootRelativeImagesPath(path: string): string {
  const p = path.trim();
  if (!p) return p;
  if (p.startsWith("/")) return p;
  if (/^images\//i.test(p)) return `/${p}`;
  return p;
}

/** Fix duplicated `.../images/images/...` from older saves / Tina quirks. */
function collapseDuplicateImagesPrefix(path: string): string {
  let out = path;
  while (out.includes("/images/images/")) {
    out = out.replace("/images/images/", "/images/");
  }
  return out;
}

function rewriteTinaAssetCdnUrl(v: string): string | null {
  try {
    const u = new URL(v);
    if (!tinaAssetHosts.has(u.hostname)) return null;
    const p = u.pathname || "";
    const idx = p.indexOf("/images/");
    if (idx !== -1) return p.slice(idx);

    // Support nested media paths like `/events/<file>` when mediaRoot points to a
    // subfolder of `/public/images/` (e.g. `/public/images/events`).
    const idxEvents = p.indexOf("/events/");
    if (idxEvents !== -1) return `/images${p.slice(idxEvents)}`;

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
  if (rewritten) return collapseDuplicateImagesPrefix(rewritten);

  const rooted = ensureRootRelativeImagesPath(v);
  if (rooted.startsWith("/")) return collapseDuplicateImagesPrefix(rooted);

  return v;
}

