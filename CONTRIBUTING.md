# Contributing

## Git workflow (code vs content)

- **App / schema / most code changes:** use a feature branch, open a **pull request** into `main`, and wait for the **CI** check (**CI / check-and-test** — `pnpm run check` and `pnpm test`) to pass before merging. That keeps `main` healthy for Netlify and for Tina.

- **Tina Cloud / editors** typically **commit and push directly to `main`** when they save in the CMS. That flow is expected here; it must keep working in production.

- **If you add GitHub “require a pull request before merging” to `main` (or a ruleset that blocks direct pushes)**, the Tina integration may no longer be able to push the same way. Before enabling that, either **configure Tina to open PRs** instead of pushing to `main`, or **add a bypass** for the Tina GitHub app / bot in your branch or ruleset settings.

## Local checks (pre-push)

After `pnpm install`, Lefthook is set up to run `pnpm run check` and `pnpm test` on **git push**. Fix failures locally or CI will block merges that depend on the same checks.

## Netlify (production)

`netlify.toml` can **skip a production build** when the only files changed are non-site metadata (for example, README, `.github` workflows, `lefthook.yml`). See `scripts/netlify-ignore-build.mjs`. To always run a Netlify build regardless, set the site environment variable `NETLIFY_IGNORE_BUILD=0` in the Netlify UI.
