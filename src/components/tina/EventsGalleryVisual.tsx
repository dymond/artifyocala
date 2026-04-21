import { tinaField } from "tinacms/dist/react";
import { useEffect, useMemo, useState } from "react";
import type React from "react";
import type { PageSectionsEventsGallery } from "../../../tina/__generated__/types";
import ResponsiveImage from "../ui/ResponsiveImage";
import { imageAlt } from "../../lib/image-alt";
import { filterActiveEventTiles, sortEventGalleryTilesByExpiryAsc } from "../../lib/events";
import { groupByMonthYear } from "../../lib/events-grouping";
import { normalizeTinaRepoMediaSrc } from "../../lib/tina-media";

type EventRow = NonNullable<NonNullable<PageSectionsEventsGallery["evgTiles"]>[number]>;

function IconX() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function EventsGalleryVisual({
  section,
}: {
  section: PageSectionsEventsGallery;
}) {
  const rows = (section.evgTiles ?? []).filter((t): t is EventRow => Boolean(t));
  const tiles = sortEventGalleryTilesByExpiryAsc(
    filterActiveEventTiles(rows, new Date(), (t) => t.evtExpiresAt),
  );
  const groups = useMemo(() => groupByMonthYear(tiles), [tiles]);

  return (
    <section className="bg-mist py-2xl">
      <div className="site-container">
        <h1 className="type-display-xl" data-tina-field={tinaField(section, "evgHeading")}>
          {section.evgHeading}
        </h1>
        {section.evgLedeHtml ? (
          <div
            className="prose-inner max-w-[52rem] [&_p]:mb-md [&_a]:font-medium [&_a]:text-accent-soft [&_a]:no-underline hover:[&_a]:underline"
            data-tina-field={tinaField(section, "evgLedeHtml")}
            dangerouslySetInnerHTML={{ __html: section.evgLedeHtml }}
          />
        ) : null}

        {groups.map((g) => (
          <div key={g.key} className="mt-xl">
            <h2 className="type-display-lg mb-md border-b-2 border-ink/15 pb-sm">
              {g.heading}
            </h2>
            <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((t) => {
                const href = t.evtHref ?? null;
                const alt = imageAlt(t.evtAlt, "Event image");
                const rawSrc = (t.evtImage ?? "").trim();
                const src = /^https?:\/\//i.test(rawSrc)
                  ? rawSrc
                  : normalizeTinaRepoMediaSrc(rawSrc);
                const frame =
                  "group relative block overflow-hidden rounded-2xl border-[3px] border-ink bg-white shadow-[10px_10px_0_0_var(--color-ink)] transition-transform duration-300 hover:-translate-y-1";

                const media = (
                  <div
                    className="relative h-full w-full overflow-hidden"
                    style={
                      {
                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                        ["--artify-events-bg" as any]: `url(${src})`,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className="pointer-events-none absolute inset-0 scale-[1.5] bg-[image:var(--artify-events-bg)] bg-cover bg-center blur-2xl opacity-80"
                      aria-hidden="true"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/10" aria-hidden="true" />
                    <div className="relative z-[1] h-full w-full">
                      <ResponsiveImage
                        src={src}
                        alt={alt}
                        width={2400}
                        height={1350}
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1024px) min(980px, 92vw), 92vw"
                        className="block h-full w-full bg-transparent object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                      />
                    </div>
                  </div>
                );

                return href ? (
                  <a
                    key={src}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${frame} cursor-pointer`}
                    aria-label="Open event in a new tab"
                    data-tina-field={tinaField(t, "evtHref")}
                  >
                    {media}
                  </a>
                ) : (
                  <button
                    key={src}
                    type="button"
                    className={`${frame} cursor-pointer`}
                    data-artify-lightbox-open="1"
                    data-artify-src={src}
                    data-artify-alt={alt}
                    aria-label="Expand image"
                    data-tina-field={tinaField(t, "evtImage")}
                  >
                    {media}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Lightbox overlay (no React hydration required; script below). */}
        <div
          id="artify-events-lightbox"
          className="pointer-events-none fixed inset-0 z-[9999] hidden"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            data-artify-lightbox-close="1"
          />
          <div id="artify-events-lightbox-stage" className="absolute inset-0">
            <img
              id="artify-events-lightbox-img"
              alt=""
              className="absolute rounded-xl border-[3px] border-ink bg-white shadow-[10px_10px_0_0_var(--color-ink)]"
            />
          </div>
          <button
            type="button"
            id="artify-events-lightbox-closebtn"
            className="pointer-events-auto fixed inline-flex cursor-pointer items-center gap-2 rounded-full border-[3px] border-ink bg-white px-4 py-2 font-display text-sm text-ink shadow-[6px_6px_0_0_var(--color-ink)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-accent-soft hover:text-ink hover:shadow-[8px_8px_0_0_var(--color-ink)] active:translate-y-0 active:shadow-[4px_4px_0_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-soft/50"
          >
            <IconX />
            Close
          </button>
        </div>

        <style>{`
          #artify-events-lightbox-closebtn { right: 1rem; top: 1rem; }
          @media (max-width: 1023px) {
            #artify-events-lightbox-closebtn { right: 1rem; bottom: 1rem; top: auto; }
          }
          @media (max-width: 639px) {
            #artify-events-lightbox-closebtn { left: 50%; right: auto; transform: translateX(-50%); bottom: 1rem; top: auto; }
          }
        `}</style>

        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
(() => {
  const overlay = document.getElementById('artify-events-lightbox');
  const stage = document.getElementById('artify-events-lightbox-stage');
  const img = document.getElementById('artify-events-lightbox-img');
  const closeBtn = document.getElementById('artify-events-lightbox-closebtn');
  if (!overlay || !stage || !img || !closeBtn) return;

  let open = false;
  let startRect = null;

  function computeTargetRect(naturalW, naturalH) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = vw * 0.9;
    const maxH = vh * 0.9;
    const scale = Math.min(maxW / naturalW, maxH / naturalH);
    const w = Math.max(1, Math.floor(naturalW * scale));
    const h = Math.max(1, Math.floor(naturalH * scale));
    const left = Math.floor((vw - w) / 2);
    const top = Math.floor((vh - h) / 2);
    return { left, top, width: w, height: h };
  }

  function setImgRect(r) {
    img.style.left = r.left + 'px';
    img.style.top = r.top + 'px';
    img.style.width = r.width + 'px';
    img.style.height = r.height + 'px';
  }

  function show() {
    overlay.classList.remove('hidden');
    overlay.classList.add('block');
    overlay.classList.remove('pointer-events-none');
    overlay.classList.add('pointer-events-auto');
    overlay.setAttribute('aria-hidden', 'false');
    open = true;
  }

  function hide() {
    overlay.classList.add('pointer-events-none');
    overlay.classList.remove('pointer-events-auto');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.add('hidden');
    overlay.classList.remove('block');
    open = false;
  }

  function close() {
    if (!open || !startRect) return hide();
    img.style.transition = 'all 220ms ease';
    setImgRect(startRect);
    window.setTimeout(() => hide(), 230);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('[data-artify-lightbox-open="1"]') : null;
    if (!btn) return;
    e.preventDefault();

    const src = btn.getAttribute('data-artify-src') || '';
    const alt = btn.getAttribute('data-artify-alt') || '';
    if (!src) return;

    const r = btn.getBoundingClientRect();
    startRect = { left: Math.floor(r.left), top: Math.floor(r.top), width: Math.floor(r.width), height: Math.floor(r.height) };
    img.src = src;
    img.alt = alt;
    img.style.transition = 'none';
    setImgRect(startRect);
    show();

    img.onload = () => {
      const target = computeTargetRect(img.naturalWidth || 1, img.naturalHeight || 1);
      // Next frame so the browser applies start rect first.
      requestAnimationFrame(() => {
        img.style.transition = 'all 260ms cubic-bezier(0.2, 0.8, 0.2, 1)';
        setImgRect(target);
      });
    };
  }, { passive: false });

  overlay.addEventListener('click', (e) => {
    // Click outside the image closes (includes clicking the backdrop).
    if (e.target === overlay) return close();
    if (e.target && e.target.closest && e.target.closest('[data-artify-lightbox-close="1"]')) return close();
    if (e.target && e.target.closest && e.target.closest('#artify-events-lightbox-img')) return;
    if (e.target && e.target.closest && e.target.closest('#artify-events-lightbox-closebtn')) return;
    // Anything else inside overlay but not the image/button should close.
    close();
  });
  closeBtn.addEventListener('click', (e) => { e.preventDefault(); close(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();
            `,
          }}
        />
      </div>
    </section>
  );
}

