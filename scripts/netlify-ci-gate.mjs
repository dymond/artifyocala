/**
 * When `netlify.toml` `ignore` would run a full production build on `main` from git,
 * we can skip (exit 0) and let GitHub Actions POST a build hook after CI passes.
 * Netlify does not cancel builds started from a build hook, regardless of `ignore` exit code.
 * @see https://docs.netlify.com/build/configure-builds/ignore-builds/
 */

/**
 * @param {Record<string, string | undefined>} env
 * @returns {boolean} true = skip this git-driven build; build hook deploys still run
 */
export function shouldDeferProductionMainToCiHook(env) {
  const off = env.NETLIFY_IGNORE_BUILD?.trim();
  if (off === "0" || off === "false") {
    return false;
  }
  return env.CONTEXT?.trim() === "production" && env.BRANCH?.trim() === "main";
}
