/**
 * Meta descriptions, JSON-LD helpers, and absolute URLs for SEO.
 */

/** Default when a CMS meta description is missing or blank. */
export const DEFAULT_SITE_DESCRIPTION =
  "Artify Ocala — art, performance, and making in Marion County, Florida.";

export function resolvePageDescription(
  input: string | null | undefined
): string {
  const t = typeof input === "string" ? input.trim() : "";
  return t || DEFAULT_SITE_DESCRIPTION;
}

export function absoluteUrl(siteOrigin: string, pathOrUrl: string): string {
  const raw = pathOrUrl.trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return new URL(path, siteOrigin).href;
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbListJsonLd(
  siteOrigin: string,
  items: BreadcrumbItem[]
): Record<string, unknown> {
  const pagePath = items.length > 0 ? items[items.length - 1].path : "/";
  const pageUrl = absoluteUrl(siteOrigin, pagePath);
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(siteOrigin, item.path),
    })),
  };
}

export function programArticleJsonLd(opts: {
  siteOrigin: string;
  pageUrl: string;
  headline: string;
  description: string;
  imageUrl?: string;
}): Record<string, unknown> {
  const article: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${opts.pageUrl}#article`,
    headline: opts.headline,
    description: opts.description,
    url: opts.pageUrl,
    author: {
      "@type": "Organization",
      "@id": `${opts.siteOrigin}/#organization`,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${opts.siteOrigin}/#organization`,
    },
    inLanguage: "en-US",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${opts.pageUrl}#webpage`,
    },
  };
  if (opts.imageUrl) {
    article.image = opts.imageUrl;
  }
  return article;
}
