import manifest from "../../public/images/_gen/manifest.json";

export type ImageVariant = {
  format: "avif" | "webp";
  width: number;
  height: number;
  src: string;
  bytes: number;
};

type Manifest = Record<string, ImageVariant[]>;

const m = manifest as Manifest;

export function imageVariants(src: string): {
  avif: ImageVariant[];
  webp: ImageVariant[];
} | null {
  const list = m[src];
  if (!list || list.length === 0) return null;
  const avif = list.filter((v) => v.format === "avif");
  const webp = list.filter((v) => v.format === "webp");
  return { avif, webp };
}

export function srcsetFor(list: ImageVariant[]): string {
  return list.map((v) => `${v.src} ${v.width}w`).join(", ");
}

