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
  return t <= now.getTime();
}

export function filterActiveEventTiles<T>(
  tiles: readonly T[],
  now: Date,
  getExpiresAt: (tile: T) => string | null | undefined,
): T[] {
  return tiles.filter((t) => !isExpired(getExpiresAt(t), now));
}

