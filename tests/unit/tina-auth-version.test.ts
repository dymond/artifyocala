import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * TinaCloud switched auth in October 2026. Site admin login requires at least
 * tinacms 3.12. This project stays on the latest published TinaCMS and CLI.
 * https://tina.io/blog/october-tinacloud-auth-changes
 */
function declaredMinimum(range: string): [number, number, number] {
  const match = range.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`Cannot read a version from "${range}"`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isAtLeast(
  version: [number, number, number],
  minimum: [number, number, number]
) {
  for (let i = 0; i < 3; i++) {
    if (version[i] > minimum[i]) return true;
    if (version[i] < minimum[i]) return false;
  }
  return true;
}

function dependencyRange(name: string) {
  const pkg = JSON.parse(
    readFileSync(new URL("../../package.json", import.meta.url), "utf8")
  ) as { dependencies?: Record<string, string> };
  const range = pkg.dependencies?.[name];
  if (!range) {
    throw new Error(`${name} is not a dependency`);
  }
  return range;
}

describe("TinaCloud admin login versions", () => {
  it("depends on the latest tinacms (3.15.2) so /admin uses the current TinaCloud login", () => {
    const range = dependencyRange("tinacms");
    expect(
      isAtLeast(declaredMinimum(range), [3, 15, 2]),
      `tinacms ${range} is not the latest release (3.15.2)`
    ).toBe(true);
  });

  it("depends on the latest @tinacms/cli (4.0.5) so the admin build matches that tinacms release", () => {
    const range = dependencyRange("@tinacms/cli");
    expect(
      isAtLeast(declaredMinimum(range), [4, 0, 5]),
      `@tinacms/cli ${range} is not the latest release (4.0.5)`
    ).toBe(true);
  });
});
