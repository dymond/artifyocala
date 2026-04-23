import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("home hero headline typography", () => {
  it("keeps container-query scaling for the artify-hero home title utility", async () => {
    const css = await readFile(
      path.join(process.cwd(), "src/styles/global.css"),
      "utf-8",
    );
    expect(css).toContain("@utility artify-hero-h1-bucket");
    expect(css).toContain("container-type: inline-size");
    expect(css).toContain("@utility artify-hero-home-title");
    expect(css).toMatch(/9\.2cqi/);
  });
});
