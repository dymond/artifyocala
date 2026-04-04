/** Elements that must not receive paint/saw (floating chrome, overlay, etc.). */
export const STUDIO_DAMAGE_MARK_CLASS = 'artify-splatter-mark';
export const STUDIO_DAMAGE_DAB_CLASS = 'artify-splatter-dab';

export function isExcludedFromStudioDamage(el: Element): boolean {
  if (!(el instanceof Element)) return true;
  if (el.id === 'artify-messy-canvas') return true;
  if (el.classList.contains(STUDIO_DAMAGE_MARK_CLASS)) return true;
  if (el.classList.contains(STUDIO_DAMAGE_DAB_CLASS)) return true;
  if (el.closest('[data-artify-studio-chrome]')) return true;
  const tag = el.tagName;
  if (tag === 'HTML' || tag === 'BODY') return true;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'LINK') return true;
  return false;
}
