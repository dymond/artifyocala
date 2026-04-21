export type EventTile = {
  image: string;
  imageAlt?: string | null;
  href: string;
  /** ISO string (recommended) or anything Date can parse. */
  expiresAt?: string | null;
};

export function isExpired(expiresAt: string | null | undefined, now: Date): boolean {
  if (!expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  if (!Number.isFinite(t)) return false;
  // Tina's datetime field can serialize "empty" as Unix epoch. Treat that as unset.
  if (t === 0) return false;
  return t <= now.getTime();
}

export function filterActiveEventTiles<T>(
  tiles: readonly T[],
  now: Date,
  getExpiresAt: (tile: T) => string | null | undefined,
): T[] {
  return tiles.filter((t) => !isExpired(getExpiresAt(t), now));
}

function parseEvtDateMs(evtDate: string | null | undefined): number | null {
  if (!evtDate) return null;
  const t = new Date(evtDate).getTime();
  if (!Number.isFinite(t)) return null;
  return t;
}

/**
 * Sort event flyers by when the event happens (`evtDate`), soonest first.
 *
 * Tiles with missing/invalid `evtDate` sort after dated tiles so they land in the
 * “Other” bucket from `groupByMonthYear` without reshuffling dated events.
 */
export function sortEventGalleryTilesByEvtDateAsc<T extends { evtDate?: string | null }>(
  tiles: readonly T[],
): T[] {
  return [...tiles].sort((a, b) => {
    const ad = parseEvtDateMs(a.evtDate);
    const bd = parseEvtDateMs(b.evtDate);
    if (ad !== null && bd !== null && ad !== bd) return ad - bd;
    if (ad === null && bd === null) return 0;
    if (ad === null) return 1;
    if (bd === null) return -1;
    return 0;
  });
}

