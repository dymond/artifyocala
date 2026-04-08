import { describe, expect, it } from "vitest";
import {
  setupWhoArchBackdrop,
  teardownWhoArchBackdrop,
} from "../../src/scripts/who-scroll-client";

describe("who-scroll-client", () => {
  it("exports setup/teardown (static who-arch import — no Vite __vitePreload)", () => {
    expect(typeof setupWhoArchBackdrop).toBe("function");
    expect(typeof teardownWhoArchBackdrop).toBe("function");
  });
});
