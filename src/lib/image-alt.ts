/**
 * Prefer CMS-provided alt text; use a readable fallback when empty.
 * Decorative images should pass `decorative: true` at the call site (alt="").
 */

export function imageAlt(
  primary: string | null | undefined,
  fallback: string,
  options?: { decorative?: boolean }
): string {
  if (options?.decorative) return "";
  const t = typeof primary === "string" ? primary.trim() : "";
  return t || fallback;
}
