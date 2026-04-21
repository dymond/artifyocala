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
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
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

  const keys = Array.from(buckets.keys()).sort((a, b) => b.localeCompare(a)); // newest first
  const groups = keys.map((key) => ({
    key,
    heading: monthHeadingFromKey(key),
    items: buckets.get(key) ?? [],
  }));

  if (undated.length) {
    groups.push({ key: "undated", heading: "Other", items: undated });
  }

  return groups;
}

