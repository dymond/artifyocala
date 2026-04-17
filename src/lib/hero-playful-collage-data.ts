import { brickGlamGallery } from "./site-images";

const G = brickGlamGallery;
const PHOTO = { width: 1600, height: 1067 } as const;
const galleryAlt = "Brick City Glam — live performance photograph";

export type BobClass =
  | "artify-hero-card-bob-1"
  | "artify-hero-card-bob-2"
  | "artify-hero-card-bob-3"
  | "artify-hero-card-bob-4";

export type FlipClass =
  | "artify-hero-flip-a"
  | "artify-hero-flip-b"
  | "artify-hero-flip-c"
  | "artify-hero-flip-d";

export type CardVariant = "bleed" | "arch" | "wide" | "door";

export type CardConfig = {
  variant: CardVariant;
  front: { src: string; alt: string; width: number; height: number };
  back: { src: string; alt: string; width: number; height: number };
  frontCaption: string;
  frontStripClass: string;
  backCaption: string;
  backStripClass: string;
  bob: BobClass;
  flip: FlipClass;
  box: string;
  layerDelaySec: number;
  loading: "eager" | "lazy";
  fetchPriority: "high" | "auto";
};

export function faceRound(v: CardVariant): string {
  if (v === "door") return "rounded-t-full rounded-b-2xl";
  if (v === "arch") return "rounded-t-[2.75rem] rounded-b-2xl";
  if (v === "wide") return "rounded-3xl";
  return "rounded-2xl";
}

export function aspectInner(v: CardVariant): string {
  if (v === "door") return "aspect-[2/3]";
  if (v === "bleed" || v === "wide") return "aspect-[5/4]";
  return "aspect-[4/5]";
}

export function photoRoundBleed(v: CardVariant): string {
  if (v === "wide") return "rounded-2xl sm:rounded-3xl";
  return "rounded-xl";
}

export const heroPlayfulCollageCards: ReadonlyArray<CardConfig> = [
  {
    variant: "door",
    front: {
      src: G[0],
      alt: `${galleryAlt} (A)`,
      width: PHOTO.width,
      height: PHOTO.height,
    },
    back: {
      src: G[10],
      alt: `${galleryAlt} (B)`,
      width: PHOTO.width,
      height: PHOTO.height,
    },
    frontCaption: "Wings & glitter & grit",
    frontStripClass:
      "bg-buzz/95 font-display text-[0.58rem] font-extrabold leading-tight text-ink",
    backCaption: "Totally different frame",
    backStripClass:
      "bg-ink font-display text-[0.54rem] font-extrabold uppercase tracking-[0.12em] text-mist",
    bob: "artify-hero-card-bob-1",
    flip: "artify-hero-flip-a",
    box: "left-[5%] top-[5%] w-[min(94%,11.5rem)] sm:left-[7%] sm:top-[5%] sm:w-[min(88%,13rem)]",
    layerDelaySec: 0.8,
    loading: "eager",
    fetchPriority: "high",
  },
  {
    variant: "arch",
    front: {
      src: G[2],
      alt: `${galleryAlt} (C)`,
      width: PHOTO.width,
      height: PHOTO.height,
    },
    back: {
      src: G[11],
      alt: `${galleryAlt} (D)`,
      width: PHOTO.width,
      height: PHOTO.height,
    },
    frontCaption: "Main character energy",
    frontStripClass:
      "bg-surge font-display text-[0.62rem] font-bold leading-tight tracking-tight text-mist sm:text-[0.65rem]",
    backCaption: "Back side, different photo",
    backStripClass:
      "bg-ink font-display text-[0.54rem] font-extrabold uppercase tracking-[0.12em] text-mist",
    bob: "artify-hero-card-bob-2",
    flip: "artify-hero-flip-b",
    box: "right-[-2%] top-[11%] w-[min(94%,14.25rem)] sm:right-[0%] sm:top-[13%] sm:w-[min(88%,16.25rem)]",
    layerDelaySec: 5.5,
    loading: "lazy",
    fetchPriority: "auto",
  },
  {
    variant: "bleed",
    front: {
      src: G[4],
      alt: `${galleryAlt} (E)`,
      width: PHOTO.width,
      height: PHOTO.height,
    },
    back: {
      src: G[12],
      alt: `${galleryAlt} (F)`,
      width: PHOTO.width,
      height: PHOTO.height,
    },
    frontCaption: "Ok who brought snacks",
    frontStripClass:
      "bg-mist font-display text-[0.56rem] font-bold italic leading-tight text-ink",
    backCaption: "Another moment entirely",
    backStripClass:
      "bg-ink font-display text-[0.54rem] font-extrabold uppercase tracking-[0.12em] text-mist",
    bob: "artify-hero-card-bob-3",
    flip: "artify-hero-flip-c",
    box: "left-[3%] bottom-[2%] w-[min(92%,13.25rem)] sm:left-[5%] sm:bottom-[4%] sm:w-[min(86%,14.75rem)]",
    layerDelaySec: 2.9,
    loading: "lazy",
    fetchPriority: "auto",
  },
  {
    variant: "wide",
    front: {
      src: G[6],
      alt: `${galleryAlt} (G)`,
      width: PHOTO.width,
      height: PHOTO.height,
    },
    back: {
      src: G[13],
      alt: `${galleryAlt} (H)`,
      width: PHOTO.width,
      height: PHOTO.height,
    },
    frontCaption: "Standing O pending",
    frontStripClass:
      "bg-club font-display text-[0.56rem] font-extrabold uppercase tracking-wide text-mist",
    backCaption: "Yep — new pic back here",
    backStripClass:
      "bg-surge font-display text-[0.54rem] font-extrabold uppercase tracking-[0.1em] text-mist",
    bob: "artify-hero-card-bob-4",
    flip: "artify-hero-flip-d",
    box: "right-[1%] bottom-[3%] w-[min(88%,12.25rem)] sm:right-[3%] sm:bottom-[4%] sm:w-[min(82%,13.75rem)]",
    layerDelaySec: 7.1,
    loading: "lazy",
    fetchPriority: "auto",
  },
];
