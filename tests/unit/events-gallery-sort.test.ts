import { describe, expect, it } from "vitest";

import { sortEventGalleryTilesByExpiryAsc } from "../../src/lib/events";

describe("events gallery sorting", () => {
  it("orders soonest expiring tiles first", () => {
    const sorted = sortEventGalleryTilesByExpiryAsc([
      { id: "a", evtDate: "2026-05-10T12:00:00.000Z", evtExpiresAt: "2026-06-01T00:00:00.000Z" },
      { id: "b", evtDate: "2026-05-10T12:00:00.000Z", evtExpiresAt: "2026-05-15T00:00:00.000Z" },
      { id: "c", evtDate: "2026-05-10T12:00:00.000Z", evtExpiresAt: "2026-07-01T00:00:00.000Z" },
    ] as any);

    expect(sorted.map((t: any) => t.id)).toEqual(["b", "a", "c"]);
  });

  it("puts missing expiry after tiles with expiry", () => {
    const sorted = sortEventGalleryTilesByExpiryAsc([
      { id: "a", evtDate: "2026-05-10T12:00:00.000Z", evtExpiresAt: null },
      { id: "b", evtDate: "2026-05-10T12:00:00.000Z", evtExpiresAt: "2026-06-01T00:00:00.000Z" },
    ] as any);

    expect(sorted.map((t: any) => t.id)).toEqual(["b", "a"]);
  });

  it("treats unix epoch expiry as unset for sorting", () => {
    const sorted = sortEventGalleryTilesByExpiryAsc([
      { id: "a", evtDate: "2026-05-10T12:00:00.000Z", evtExpiresAt: "1970-01-01T00:00:00.000Z" },
      { id: "b", evtDate: "2026-05-10T12:00:00.000Z", evtExpiresAt: "2026-06-01T00:00:00.000Z" },
    ] as any);

    expect(sorted.map((t: any) => t.id)).toEqual(["b", "a"]);
  });

  it("when expiry ties, sorts by evtDate descending", () => {
    const sorted = sortEventGalleryTilesByExpiryAsc([
      { id: "a", evtDate: "2026-05-01T12:00:00.000Z", evtExpiresAt: "2026-06-01T00:00:00.000Z" },
      { id: "b", evtDate: "2026-05-20T12:00:00.000Z", evtExpiresAt: "2026-06-01T00:00:00.000Z" },
    ] as any);

    expect(sorted.map((t: any) => t.id)).toEqual(["b", "a"]);
  });
});
