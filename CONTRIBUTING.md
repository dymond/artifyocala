# Contributing

## Git workflow (code vs content)

- **App / schema / most code changes:** use a feature branch, open a **pull request** into `main`, and wait for the **CI** check (**CI / check-and-test** — `pnpm run check` and `pnpm test`) to pass before merging. That keeps `main` healthy for Netlify and for Tina.

- **Tina Cloud / editors** typically **commit and push directly to `main`** when they save in the CMS. That flow is expected here; it must keep working in production.

- **If you add GitHub “require a pull request before merging” to `main` (or a ruleset that blocks direct pushes)**, the Tina integration may no longer be able to push the same way. Before enabling that, either **configure Tina to open PRs** instead of pushing to `main`, or **add a bypass** for the Tina GitHub app / bot in your branch or ruleset settings.

## Local checks (pre-push)

After `pnpm install`, Lefthook is set up to run `pnpm run check` and `pnpm test` on **git push**. Fix failures locally or CI will block merges that depend on the same checks.

On GitHub Actions, the workflow runs `pnpm run check:ci` (a smaller Node heap) instead of `pnpm run check` so `astro check` does not get killed on standard runners. Locally you can keep using `pnpm run check` if you have enough RAM.

## Netlify (production)

`netlify.toml` can **skip a production build** when the only files changed are non-site metadata (for example, README, `.github` workflows, `lefthook.yml`). See `scripts/netlify-ignore-build.mjs`. To always run a Netlify build regardless, set the site environment variable `NETLIFY_IGNORE_BUILD=0` in the Netlify UI.

### Netlify vs GitHub Actions (order of operations)

A **git push to `main` triggers two independent webhooks**: Netlify starts a site build, and GitHub runs Actions, **in parallel**. Netlify does not wait for **CI / check-and-test** to go green, so a failing workflow can still produce a (possibly failing) Netlify build. That is why you can see a Netlify build “before” GitHub is green; it is the same `push` event, not a bug in this repo’s workflow.

**If you need Netlify to run only after CI passes:** turn off **automatic production deploys** from the connected Git in Netlify and trigger deploys with a [build hook](https://docs.netlify.com/configure-builds/build-hooks/) from a GitHub Action that runs at the end of a successful `CI` job (or use a similar “deploy on green only” pattern). There is no setting in the repo that alone forces Netlify to block on an arbitrary GitHub check; it has to be wired as a two-step (CI → build hook) flow.
