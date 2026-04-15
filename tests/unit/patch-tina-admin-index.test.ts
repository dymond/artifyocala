import { describe, expect, it } from "vitest";
import { patchTinaAdminIndexHtml } from "../../scripts/patch-tina-admin-index.mjs";

describe("patch-tina-admin-index", () => {
  it("injects redirect script into </head>", () => {
    const input =
      "<html><head><meta charset=\"utf-8\"></head><body>ok</body></html>";
    const out = patchTinaAdminIndexHtml(input, { previewPath: "/tina-preview/" });
    expect(out).toContain("artify:tina-admin-redirect:start");
    expect(out).toContain("#/~/");
    expect(out).toContain("tina-preview");
    expect(out).toMatch(/<\/script>\s*<!-- artify:tina-admin-redirect:end -->\s*<\/head>/);
  });

  it("is idempotent", () => {
    const input =
      "<html><head><meta charset=\"utf-8\"></head><body>ok</body></html>";
    const once = patchTinaAdminIndexHtml(input, { previewPath: "/tina-preview/" });
    const twice = patchTinaAdminIndexHtml(once, { previewPath: "/tina-preview/" });
    expect(twice).toBe(once);
  });
});

