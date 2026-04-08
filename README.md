# Artify Ocala (Astro + TinaCMS)

Site source for [artify.diy](https://artify.diy), built with [Astro](https://astro.build) and [TinaCMS](https://tina.io).

## Prerequisites

- **Node** 22.12+ (see `engines` in [package.json](package.json))
- **pnpm** via [Corepack](https://nodejs.org/api/corepack.html) (recommended): `corepack enable` — the repo pins the version with the `packageManager` field in [package.json](package.json)
- Copy [.env.example](.env.example) to `.env` for Tina local credentials

## Commands

Run from the repository root:

| Command | Action |
| :------ | :----- |
| `pnpm install` | Install dependencies |
| `pnpm run dev` | Tina + Astro dev server (see [package.json](package.json) script) |
| `pnpm run build:deploy` | Full production build: always runs `tinacms build` + Astro (use locally before release) |
| `pnpm run build:netlify:ci` | Netlify build entry (see below); skips `tinacms build` when safe |
| `pnpm run build` | Stricter local Tina build (no `--skip-cloud-checks`) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm run verify` | Tests + Netlify offline build (forces `HEAD=main` / `NETLIFY_BRANCH=main` so Tina Cloud matches the `main` branch when you are on a feature branch) |

### Conditional Tina build on Netlify

[netlify.toml](netlify.toml) runs **`pnpm run build:netlify:ci`**, which compares **`CACHED_COMMIT_REF`** and **`COMMIT_REF`** (see [Netlify git env vars](https://docs.netlify.com/configure-builds/environment-variables/#git-metadata)) and runs **`tinacms build`** only if something under the “Tina-required” paths changed.

**Always runs full `tinacms build` when:**

- **`COMMIT_REF`** is missing, or **`CACHED_COMMIT_REF`** is missing or equals **`COMMIT_REF`** (first build, cache reset, or unreliable diff).
- **`git diff`** is empty or fails.
- Any changed file matches: `tina/**` (except `tina/__generated__/.cache/`), `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `astro-tina-directive/**`, `public/admin/**`, or `src/lib/tina-graphql-client.ts`.

**Can skip `tinacms build` when** every changed file is only under **`src/content/**`** or **`public/`** outside **`public/admin/`** (typical CMS text/media edits).

**Optional Netlify environment overrides:**

- **`FORCE_TINA_BUILD=1`**: always run `tinacms build`.
- **`SKIP_TINA_BUILD=1`**: never run `tinacms build` (only `astro build`; admin/types may be stale—emergency use).

Logic lives in [scripts/netlify-tina-build-gate.mjs](scripts/netlify-tina-build-gate.mjs) with tests in [tests/unit/netlify-tina-build-gate.test.ts](tests/unit/netlify-tina-build-gate.test.ts).

## Project layout

| Path | Purpose |
| :--- | :------ |
| `src/pages/` | Routes (file-based routing) |
| `src/content/` | Astro content collections + JSON |
| `tina/` | Tina schema and config |
| `public/` | Static assets |
