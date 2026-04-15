import { describe, expect, it } from "vitest";

import { makeVariantName } from "../../scripts/images-build.mjs";

describe("images-build", () => {
  it("makes variant names unique across subfolders", () => {
    const a = "/repo/public/images/PXL_1.jpg";
    const b = "/repo/public/images/images/PXL_1.jpg";
    const n1 = makeVariantName(a, 480, ".webp");
    const n2 = makeVariantName(b, 480, ".webp");
    expect(n1).not.toEqual(n2);
  });
});

