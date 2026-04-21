import { describe, expect, it } from "vitest";
import { groupByMonthYear } from "../../src/lib/events-grouping";

describe("events grouping", () => {
  it("groups items by month/year (soonest month first) and sorts within a month by evtDate", () => {
    const groups = groupByMonthYear([
      { id: "a", evtDate: "2026-05-10T10:00:00.000Z" },
      { id: "b", evtDate: "2026-04-01T10:00:00.000Z" },
      { id: "c", evtDate: "2026-05-02T10:00:00.000Z" },
    ] as any);

    expect(groups.map((g) => g.key)).toEqual(["2026-04", "2026-05"]);
    expect(groups[0]?.items.map((x: any) => x.id)).toEqual(["b"]);
    expect(groups[1]?.items.map((x: any) => x.id)).toEqual(["c", "a"]);
    expect(groups[0]?.heading).toBe("April 2026");
    expect(groups[1]?.heading).toBe("May 2026");
  });

  it("groups by UTC month/year (avoids timezone drift in Tina preview)", () => {
    // If the viewer is behind UTC, this instant may be the prior local date/month.
    // Grouping must still match the intended UTC month.
    const groups = groupByMonthYear([
      { id: "a", evtDate: "2026-05-01T00:30:00.000Z" },
      { id: "b", evtDate: "2026-04-30T23:30:00.000Z" },
    ] as any);

    expect(groups.map((g) => g.key)).toEqual(["2026-04", "2026-05"]);
  });

  it("puts missing/invalid dates into Other", () => {
    const groups = groupByMonthYear([
      { id: "a", evtDate: null },
      { id: "b", evtDate: "nope" },
      { id: "c", evtDate: "2026-04-01T10:00:00.000Z" },
    ] as any);

    expect(groups.map((g) => g.key)).toEqual(["2026-04", "undated"]);
    expect(groups[1]?.items.map((x: any) => x.id).sort()).toEqual(["a", "b"]);
  });
});

