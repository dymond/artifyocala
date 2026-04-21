export type EventsTileInput = {
  evtDate?: string | null;
};

export type MonthGroup<T> = {
  key: string; // YYYY-MM
  heading: string;
  items: T[];
};

function yyyymm(d: Date): string {
  // Use UTC so month/year grouping is stable across viewer timezones
  // (Tina preview runs in the editor's browser; production grouping runs server-side).
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthHeadingFromKey(key: string): string {
  const [y, m] = key.split("-").map((x) => Number(x));
  const d = new Date(Date.UTC(y, m - 1, 1));
  // Force UTC so headings don't drift by timezone (e.g. UTC midnight is prior day in US timezones).
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function parseEvtDateMs(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return null;
  return t;
}

function compareEvtDateAsc<T extends EventsTileInput>(a: T, b: T): number {
  const am = parseEvtDateMs(a.evtDate);
  const bm = parseEvtDateMs(b.evtDate);
  if (am !== null && bm !== null && am !== bm) return am - bm;
  if (am === null && bm === null) return 0;
  if (am === null) return 1;
  if (bm === null) return -1;
  return 0;
}

export function groupByMonthYear<T extends EventsTileInput>(
  items: readonly T[],
): MonthGroup<T>[] {
  const buckets = new Map<string, T[]>();
  const undated: T[] = [];

  for (const it of items) {
    const raw = it.evtDate;
    if (!raw) {
      undated.push(it);
      continue;
    }
    const t = new Date(raw).getTime();
    if (!Number.isFinite(t)) {
      undated.push(it);
      continue;
    }
    const key = yyyymm(new Date(t));
    const arr = buckets.get(key);
    if (arr) arr.push(it);
    else buckets.set(key, [it]);
  }

  // YYYY-MM sorts lexicographically in calendar order — soonest month first.
  const keys = Array.from(buckets.keys()).sort((a, b) => a.localeCompare(b));
  const groups = keys.map((key) => {
    const itemsInMonth = [...(buckets.get(key) ?? [])];
    itemsInMonth.sort(compareEvtDateAsc);
    return {
      key,
      heading: monthHeadingFromKey(key),
      items: itemsInMonth,
    };
  });

  if (undated.length) {
    groups.push({ key: "undated", heading: "Other", items: undated });
  }

  return groups;
}

