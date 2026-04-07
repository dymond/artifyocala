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
| `pnpm run build:deploy` | Production build (Tina + Astro), matches Netlify |
| `pnpm run build` | Stricter local Tina build (no `--skip-cloud-checks`) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm run verify` | Tests + Netlify offline build (forces `HEAD=main` / `NETLIFY_BRANCH=main` so Tina Cloud matches the `main` branch when you are on a feature branch) |

## Project layout

| Path | Purpose |
| :--- | :------ |
| `src/pages/` | Routes (file-based routing) |
| `src/content/` | Astro content collections + JSON |
| `tina/` | Tina schema and config |
| `public/` | Static assets |

## Docs

Implementation and migration plans live under [docs/superpowers/plans/](docs/superpowers/plans/).
