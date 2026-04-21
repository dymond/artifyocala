function parseWords(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x)).filter(Boolean);
  } catch {
    return [];
  }
}

function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function initWordRotators() {
  if (shouldReduceMotion()) return;
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>('[data-artify-word-rotator="1"]')
  );
  for (const el of nodes) {
    if ((el as any).__artifyWordRotatorInit) continue;
    (el as any).__artifyWordRotatorInit = true;

    const words = parseWords(el.getAttribute("data-artify-words"));
    if (words.length <= 1) continue;

    let i = 0;
    const tick = () => {
      i = (i + 1) % words.length;
      el.textContent = words[i] ?? "";
    };

    const id = window.setInterval(tick, 2200);
    // Best-effort cleanup: if removed from DOM, stop interval.
    const obs = new MutationObserver(() => {
      if (!document.contains(el)) {
        window.clearInterval(id);
        obs.disconnect();
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWordRotators, { once: true });
  } else {
    initWordRotators();
  }
}

