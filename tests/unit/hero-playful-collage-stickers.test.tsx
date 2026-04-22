import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HeroPlayfulCollage from "../../src/components/tina/HeroPlayfulCollage";

describe("HeroPlayfulCollage stickers", () => {
  it("includes disco ball + glue gun decorative stickers", () => {
    const html = renderToStaticMarkup(<HeroPlayfulCollage />);
    expect(html).toContain("Decorative disco ball");
    expect(html).toContain("Decorative bedazzled glue gun");
    expect(html).toContain("Decorative paint roller stamp");
  });
});

