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

function parseFiniteExpiresAtMs(expiresAt: string | null | undefined): number | null {
  if (!expiresAt) return null;
  const t = new Date(expiresAt).getTime();
  if (!Number.isFinite(t)) return null;
  // Match `isExpired`: Tina can serialize "empty" as Unix epoch — treat as unset for sorting too.
  if (t === 0) return null;
  return t;
}

function parseEvtDateMs(evtDate: string | null | undefined): number | null {
  if (!evtDate) return null;
  const t = new Date(evtDate).getTime();
  if (!Number.isFinite(t)) return null;
  return t;
}

/**
 * Sort event flyers so the soonest-ending tiles appear first.
 *
 * - Tiles with a real `evtExpiresAt` are ordered ascending by expiry.
 * - Tiles without expiry (or invalid/epoch "empty" values) sort after dated expiries.
 * - When expiry ties (or both missing), fall back to `evtDate` descending (later event dates first).
 */
export function sortEventGalleryTilesByExpiryAsc<T extends { evtExpiresAt?: string | null; evtDate?: string | null }>(
  tiles: readonly T[],
): T[] {
  return [...tiles].sort((a, b) => {
    const ae = parseFiniteExpiresAtMs(a.evtExpiresAt);
    const be = parseFiniteExpiresAtMs(b.evtExpiresAt);

    const aHas = ae !== null;
    const bHas = be !== null;
    if (aHas && bHas && ae !== be) return ae - be;
    if (aHas !== bHas) return aHas ? -1 : 1;

    const ad = parseEvtDateMs(a.evtDate);
    const bd = parseEvtDateMs(b.evtDate);
    if (ad !== null && bd !== null && ad !== bd) return bd - ad;
    if (ad !== null && bd === null) return -1;
    if (ad === null && bd !== null) return 1;
    return 0;
  });
}

