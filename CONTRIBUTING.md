# Contributing

## Git workflow (code vs content)

- **App / schema / most code changes:** use a feature branch and open a **pull request** into `main` when you want review before it ships.

- **Tina Cloud / editors** typically **commit and push directly to `main`** when they save in the CMS (including media). That flow is expected here.

- **If you add GitHub “require a pull request before merging” to `main`**, the Tina integration may no longer be able to push the same way. Before enabling that, either **configure Tina to open PRs** instead of pushing to `main`, or **add a bypass** for the Tina GitHub app / bot in your branch or ruleset settings.

## Local checks (optional)

Run **`pnpm run check`** and **`pnpm test`** before merging larger code changes if you want the same confidence as before; nothing in this repo runs them automatically on push.

## Netlify (production)

`netlify.toml` can **skip a production build** when the only files changed are non-site metadata (for example, README, `.github` workflows). See `scripts/netlify-ignore-build.mjs`. To always run a Netlify build regardless, set the site environment variable `NETLIFY_IGNORE_BUILD=0` in the Netlify UI.
