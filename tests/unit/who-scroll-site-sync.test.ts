/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";

const setup = vi.fn();
const teardown = vi.fn();

vi.mock("../../src/scripts/who-scroll-client", () => ({
  setupWhoArchBackdrop: () => setup(),
  teardownWhoArchBackdrop: () => teardown(),
}));

describe("who-scroll-site-sync", () => {
  beforeEach(() => {
    setup.mockClear();
    teardown.mockClear();
    document.body.innerHTML = "";
  });

  it("calls setup when #who exists", async () => {
    document.body.innerHTML = '<div id="who"></div>';
    const { syncWhoArchBackdropForRoute } = await import(
      "../../src/scripts/who-scroll-site-sync"
    );
    syncWhoArchBackdropForRoute();
    expect(setup).toHaveBeenCalledTimes(1);
    expect(teardown).not.toHaveBeenCalled();
  });

  it("calls teardown when #who is absent", async () => {
    const { syncWhoArchBackdropForRoute } = await import(
      "../../src/scripts/who-scroll-site-sync"
    );
    syncWhoArchBackdropForRoute();
    expect(teardown).toHaveBeenCalledTimes(1);
    expect(setup).not.toHaveBeenCalled();
  });
});
