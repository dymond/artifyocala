/// <reference types="astro/client" />
/// <reference types="astro/jsx-runtime" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
}

/** Lets plain TS tooling resolve HTML in `.astro` templates (maps to Astro’s element types). */
declare namespace JSX {
  interface IntrinsicElements extends astroHTML.JSX.IntrinsicElements {}
}
