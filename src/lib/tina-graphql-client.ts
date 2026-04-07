/**
 * Tina GraphQL client for Astro (build-time / SSR). Credentials come from the
 * environment only — never from `tina/__generated__/client.ts`, which Tina CLI
 * overwrites with inlined secrets and breaks Netlify secrets scanning.
 */
import { createClient } from "tinacms/dist/client";
import { queries } from "../../tina/__generated__/types";

const clientId = process.env.PUBLIC_TINA_CLIENT_ID?.trim();
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.NETLIFY_BRANCH ||
  process.env.HEAD ||
  "main";

if (!clientId) {
  throw new Error(
    "PUBLIC_TINA_CLIENT_ID is required for Tina content (set in .env or hosting env)."
  );
}

const url = `https://content.tinajs.io/2.2/content/${clientId}/github/${branch}`;

const tinaToken =
  process.env.TINA_TOKEN?.trim() || process.env.TINA_TOKEN_LOCAL?.trim() || "";

export const client = createClient({
  url,
  token: tinaToken,
  queries,
});

export default client;
