export type EventTileListItemInput = {
  evtAlt?: string | null;
  evtDate?: string | null;
};

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function firstWords(s: string, maxWords: number, maxChars: number): string {
  const words = collapseWhitespace(s).split(" ").filter(Boolean);
  if (!words.length) return "";

  const limited = words.slice(0, maxWords);
  let out = limited.join(" ");
  const clippedByWords = words.length > maxWords;

  if (out.length > maxChars) {
    out = out.slice(0, maxChars).trimEnd();
    return `${out}…`;
  }

  return clippedByWords ? `${out}…` : out;
}

function formatEvtDateUtcLabel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return null;

  // Match public Events grouping: interpret stored datetimes in UTC so labels
  // line up with month headings across editor timezones.
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(t));
}

export function labelEventTileListItem(item: EventTileListItemInput): string {
  const alt = typeof item.evtAlt === "string" ? item.evtAlt : "";
  const altPreview = firstWords(alt, 8, 72);
  if (altPreview) return altPreview;

  const dateLabel = formatEvtDateUtcLabel(item.evtDate);
  if (dateLabel) return `Event - ${dateLabel}`;

  return "Event tile";
}
