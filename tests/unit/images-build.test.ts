import { describe, expect, it } from "vitest";

import { filterChangedImagePaths, makeVariantName } from "../../scripts/images-build.mjs";

describe("images-build", () => {
  it("makes variant names unique across subfolders", () => {
    const a = "/repo/public/images/PXL_1.jpg";
    const b = "/repo/public/images/images/PXL_1.jpg";
    const n1 = makeVariantName(a, 480, ".webp");
    const n2 = makeVariantName(b, 480, ".webp");
    expect(n1).not.toEqual(n2);
  });

  it("filters changed paths down to real source images", () => {
    expect(
      filterChangedImagePaths([
        "public/images/events/new.jpg",
        "public/images/_gen/manifest.json",
        "public/images/events/not-image.txt",
        "src/pages/index.astro",
        "public/images/events/nested/photo.PNG",
        "public/images/events/thing.webp",
        "public/images/events/thing.avif",
      ])
    ).toEqual(["public/images/events/new.jpg", "public/images/events/nested/photo.PNG"]);
  });
});

