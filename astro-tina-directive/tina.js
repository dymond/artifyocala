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
    const hydrate = await load();
    await hydrate();
  } catch (error) {
    console.error("Tina client:tina directive failed:", error);
  }
};
