import { describe, expect, it } from "vitest";

import { sortEventGalleryTilesByEvtDateAsc } from "../../src/lib/events";

describe("events gallery sorting", () => {
  it("orders soonest event dates first", () => {
    const sorted = sortEventGalleryTilesByEvtDateAsc([
      { id: "a", evtDate: "2026-06-01T00:00:00.000Z" },
      { id: "b", evtDate: "2026-05-15T00:00:00.000Z" },
      { id: "c", evtDate: "2026-05-01T00:00:00.000Z" },
    ] as any);

    expect(sorted.map((t: any) => t.id)).toEqual(["c", "b", "a"]);
  });

  it("puts missing or invalid evtDate after dated tiles", () => {
    const sorted = sortEventGalleryTilesByEvtDateAsc([
      { id: "a", evtDate: null },
      { id: "b", evtDate: "2026-05-10T12:00:00.000Z" },
      { id: "c", evtDate: "not-a-date" },
    ] as any);

    expect(sorted.map((t: any) => t.id)).toEqual(["b", "a", "c"]);
  });
});
