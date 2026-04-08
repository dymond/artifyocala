import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const thisDir = dirname(fileURLToPath(import.meta.url));
const whoScrollPath = join(thisDir, "../../src/scripts/who-scroll-client.ts");

describe("who-scroll-client dynamic import", () => {
  it("uses @vite-ignore on who-arch-backdrop (paired with Rollup strip plugin on CI)", () => {
    const src = readFileSync(whoScrollPath, "utf8");
    expect(src).toMatch(
      /import\s*\(\s*\/\*\s*@vite-ignore\s*\*\/\s*["']\.\/who-arch-backdrop["']\s*\)/,
    );
  });
});
