import { describe, expect, it } from "vitest";
import { filterActiveEventTiles, isExpired } from "../../src/lib/events";

describe("events expiry", () => {
  it("treats missing expiry as active", () => {
    const now = new Date("2026-04-17T12:00:00.000Z");
    expect(isExpired(undefined, now)).toBe(false);
    expect(isExpired(null, now)).toBe(false);
    expect(filterActiveEventTiles([{ expiresAt: null }], now, (t) => t.expiresAt)).toHaveLength(
      1,
    );
  });

  it("treats invalid expiry as active", () => {
    const now = new Date("2026-04-17T12:00:00.000Z");
    expect(isExpired("not-a-date", now)).toBe(false);
    expect(filterActiveEventTiles([{ expiresAt: "nope" }], now, (t) => t.expiresAt)).toHaveLength(
      1,
    );
  });

  it("treats unix epoch expiry as unset (Tina empty datetime)", () => {
    const now = new Date("2026-04-17T12:00:00.000Z");
    expect(isExpired("1970-01-01T00:00:00.000Z", now)).toBe(false);
    expect(
      filterActiveEventTiles([{ id: "a", expiresAt: "1970-01-01T00:00:00.000Z" }], now, (t) =>
        t.expiresAt,
      ),
    ).toHaveLength(1);
  });

  it("expires tiles at or before now", () => {
    const now = new Date("2026-04-17T12:00:00.000Z");
    expect(isExpired("2026-04-17T12:00:00.000Z", now)).toBe(true);
    expect(isExpired("2026-04-17T11:59:59.999Z", now)).toBe(true);
    expect(isExpired("2026-04-17T12:00:00.001Z", now)).toBe(false);
  });

  it("filters out expired tiles", () => {
    const now = new Date("2026-04-17T12:00:00.000Z");
    const tiles = [
      { id: "a", expiresAt: "2026-04-17T11:00:00.000Z" },
      { id: "b", expiresAt: "2026-04-17T13:00:00.000Z" },
      { id: "c" as const, expiresAt: null },
    ];
    const active = filterActiveEventTiles(tiles, now, (t) => t.expiresAt).map((t) => t.id);
    expect(active).toEqual(["b", "c"]);
  });
});

