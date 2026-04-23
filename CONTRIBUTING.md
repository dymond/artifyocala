# Contributing

## Git workflow (code vs content)

- **App / schema / most code changes:** use a feature branch, open a **pull request** into `main`, and wait for the **CI** check (**CI / check-and-test** — `pnpm run check` and `pnpm test`) to pass before merging. That keeps `main` healthy for Netlify and for Tina.

- **Tina Cloud / editors** typically **commit and push directly to `main`** when they save in the CMS. That flow is expected here; it must keep working in production.

- **If you add GitHub “require a pull request before merging” to `main` (or a ruleset that blocks direct pushes)**, the Tina integration may no longer be able to push the same way. Before enabling that, either **configure Tina to open PRs** instead of pushing to `main`, or **add a bypass** for the Tina GitHub app / bot in your branch or ruleset settings.

## Local checks (pre-push)

After `pnpm install`, Lefthook is set up to run `pnpm run check` and `pnpm test` on **git push**. Fix failures locally or CI will block merges that depend on the same checks.

On GitHub Actions, the workflow runs `pnpm run check:ci` (a smaller Node heap) instead of `pnpm run check` so `astro check` does not get killed on standard runners. Locally you can keep using `pnpm run check` if you have enough RAM.

## Netlify (production)

`netlify.toml` can **skip a production build** when the only files changed are non-site metadata (for example, README, `.github` workflows, `lefthook.yml`). See `scripts/netlify-ignore-build.mjs`. To always run a Netlify build on every git push regardless, set the site environment variable `NETLIFY_IGNORE_BUILD=0` in the Netlify UI (for example if you need an emergency deploy without waiting for GitHub Actions).

### Deploy only after CI (saves Netlify build minutes)

Netlify cannot wait for GitHub Checks on its own: a **push to `main` still notifies Netlify and GitHub in parallel**. This repo wires the rest in two places:

1. **`netlify.toml` `ignore`** — For **production** and branch **`main`**, when there are **site-relevant** file changes, the ignore step **ends the build early** (exit 0) so Netlify does not run a full production build from that git event. [Netlify’s docs](https://docs.netlify.com/build/configure-builds/ignore-builds/) state that the ignore command **does not cancel** a deploy that was started by a **[build hook](https://docs.netlify.com/configure-builds/build-hooks/)**, so hook-triggered builds still run.

2. **GitHub Actions** — After **`CI / check-and-test`** succeeds on a **push to `main`**, the workflow **POSTs** the Netlify build hook URL so the real site build runs once. Add a repository secret **`NETLIFY_BUILD_HOOK_URL`** with the full hook URL.

**What you set up in Netlify (one-time):**

- **Build status** must stay **Active** (not “Stopped builds”). If builds are stopped site-wide, **build hooks do not run** either; see [Stop or activate builds](https://docs.netlify.com/configure-builds/stop-or-activate-builds/).
- **Build hooks:** Site configuration → Build & deploy → **Build hooks** → add a hook targeting branch **`main`** → copy the **POST** URL into the GitHub secret **`NETLIFY_BUILD_HOOK_URL`**.

You do **not** need to disable the Git connection or “automatic deploys” for this pattern: the **`ignore`** script is what stops the expensive git-triggered production build on `main` when there are real code/content changes; the hook from GitHub runs the build after CI passes.

### Netlify vs GitHub Actions (order of operations)

On **`main`**, GitHub Actions still runs in parallel with Netlify’s git notification, but production no longer relies on the **full** Netlify build from that first git event for site changes: that run is skipped, and the workflow triggers the build hook after **`CI / check-and-test`** is green. **Deploy previews** for pull requests use a different Netlify context and are unchanged.
