import type { APIRoute } from "astro";
import { listEventsImageUrls } from "../../lib/events-images.server";

export const GET: APIRoute = async () => {
  const images = await listEventsImageUrls();
  return new Response(JSON.stringify({ images }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
};

