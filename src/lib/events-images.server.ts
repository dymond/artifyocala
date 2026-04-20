import * as fs from "node:fs/promises";
import * as fssync from "node:fs";
import * as path from "node:path";

const allowedExt = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

export async function listEventsImageUrls(): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "images", "events");
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  return dirents
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      return allowedExt.has(ext);
    })
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/images/events/${name}`);
}

export function listEventsImageUrlsSync(): string[] {
  const dir = path.join(process.cwd(), "public", "images", "events");
  const dirents = fssync.readdirSync(dir, { withFileTypes: true });
  return dirents
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => allowedExt.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/images/events/${name}`);
}

