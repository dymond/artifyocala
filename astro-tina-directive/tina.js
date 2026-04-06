/**
 * Hydrate only inside Tina’s visual-editing iframe (side preview).
 * @type {import('astro').ClientDirective}
 */
export default async (load, _options, _el) => {
  try {
    const isInIframe = window.self !== window.top;
    if (!isInIframe) {
      return;
    }

    const hydrate = await load();
    await hydrate();
  } catch (error) {
    console.error("Tina client:tina directive failed:", error);
  }
};
