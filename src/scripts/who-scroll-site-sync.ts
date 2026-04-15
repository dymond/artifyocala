import { setupWhoArchBackdrop, teardownWhoArchBackdrop } from "./who-scroll-client";

/** Call after route changes / DOM ready when `#who` may appear or disappear. */
export function syncWhoArchBackdropForRoute(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("who")) {
    setupWhoArchBackdrop();
  } else {
    teardownWhoArchBackdrop();
  }
}
