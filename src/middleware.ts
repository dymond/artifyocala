import type { MiddlewareHandler } from "astro";

/**
 * `/site-chrome` was removed; show the normal 404 page (same as unknown routes).
 */
export const onRequest: MiddlewareHandler = (context, next) => {
  const path = context.url.pathname.replace(/\/+$/, "") || "/";
  if (path === "/site-chrome" || path.startsWith("/site-chrome/")) {
    return context.rewrite(new URL("/404", context.url));
  }
  return next();
};
