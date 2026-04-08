/**
 * Hydrate Tina-aware React islands on the real site and in Tina’s preview iframe.
 *
 * Previously this only hydrated inside an iframe to save JS on visitors — but that
 * meant no React hydration on artify.diy, so effects never ran (e.g. Who scroll
 * Three.js backdrop). Visual editing still works when the same bundle hydrates on-page.
 *
 * @type {import('astro').ClientDirective}
 */
export default async (load, _options, _el) => {
  try {
    const shouldHydrate = (() => {
      // Tina visual editing: when the site is loaded inside the editor, it's usually
      // inside an iframe whose `window.top` is on `/admin`. We also support a simple
      // query-param trigger for direct-to-page preview sessions.
      try {
        const topPath = window.top?.location?.pathname || "";
        if (topPath.startsWith("/admin")) return true;
      } catch {
        // cross-origin / access denied; fall back to current window checks
      }

      try {
        const sp = new URLSearchParams(window.location.search || "");
        if (sp.has("tina") || sp.has("tina-preview") || sp.has("tinaPreview")) {
          return true;
        }
      } catch {
        // ignore
      }

      try {
        const v =
          window.localStorage?.getItem("tina.isEditing") ||
          window.localStorage?.getItem("__tina_is_editing__");
        if (v === "true" || v === "1") return true;
      } catch {
        // ignore
      }

      return false;
    })();

    if (!shouldHydrate) return;

    const hydrate = await load();
    await hydrate();
  } catch (error) {
    console.error("Tina client:tina directive failed:", error);
  }
};
