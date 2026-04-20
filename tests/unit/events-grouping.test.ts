import { describe, expect, it } from "vitest";
import { groupByMonthYear } from "../../src/lib/events-grouping";

describe("events grouping", () => {
  it("groups items by month/year (newest first)", () => {
    const groups = groupByMonthYear([
      { id: "a", evtDate: "2026-05-10T10:00:00.000Z" },
      { id: "b", evtDate: "2026-04-01T10:00:00.000Z" },
      { id: "c", evtDate: "2026-05-02T10:00:00.000Z" },
    ] as any);

    expect(groups.map((g) => g.key)).toEqual(["2026-05", "2026-04"]);
    expect(groups[0]?.items.map((x: any) => x.id).sort()).toEqual(["a", "c"]);
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

