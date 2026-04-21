import { describe, expect, it } from "vitest";

import { labelEventTileListItem } from "../../tina/event-tile-label";

describe("labelEventTileListItem", () => {
  it("prefers a short alt-text preview", () => {
    expect(
      labelEventTileListItem({
        evtAlt: "  Live music night at the club  ",
        evtDate: "2026-04-21T00:00:00.000Z",
      }),
    ).toBe("Live music night at the club");
  });

  it("falls back to a UTC-stable event date label when alt is empty", () => {
    expect(
      labelEventTileListItem({
        evtAlt: "",
        evtDate: "2026-04-21T12:34:56.000Z",
      }),
    ).toBe("Event - Apr 21, 2026");
  });

  it("falls back to a generic label when date is missing/invalid", () => {
    expect(labelEventTileListItem({ evtAlt: "   ", evtDate: "" })).toBe("Event tile");
    expect(labelEventTileListItem({ evtAlt: undefined, evtDate: "not-a-date" })).toBe(
      "Event tile",
    );
  });
});
