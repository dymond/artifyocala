/**
 * Tina GraphQL client for Astro (build-time / SSR). Credentials come from the
 * environment only — never from `tina/__generated__/client.ts`, which Tina CLI
 * overwrites with inlined secrets and breaks Netlify secrets scanning.
 */
import { createClient } from "tinacms/dist/client";
import { getTinaGitBranch } from "../../tina/branch";
import { queries } from "../../tina/__generated__/types";

type EnvLike = Record<string, string | undefined>;

const viteEnv: EnvLike =
  typeof import.meta !== "undefined" && (import.meta as any).env
    ? ((import.meta as any).env as EnvLike)
    : {};

const nodeEnv: EnvLike =
  typeof process !== "undefined" && process.env ? (process.env as EnvLike) : {};

const env = { ...nodeEnv, ...viteEnv };

const clientId = env.PUBLIC_TINA_CLIENT_ID?.trim();
const branch = getTinaGitBranch();

if (!clientId) {
  throw new Error(
    "PUBLIC_TINA_CLIENT_ID is required for Tina content (set in .env or hosting env)."
  );
}

// Dev: use local Tina GraphQL server (started by `tinacms dev`).
// Prod/CI: use Tina Content API.
const localUrl = env.TINA_LOCAL_GRAPHQL_URL?.trim() || "http://localhost:4001/graphql";
const cloudUrl = `https://content.tinajs.io/2.2/content/${clientId}/github/${branch}`;
const url =
  env.NODE_ENV === "development" || env.DEV === "true" ? localUrl : cloudUrl;

const tinaToken =
  env.TINA_TOKEN?.trim() || env.TINA_TOKEN_LOCAL?.trim() || "";

export const client = createClient({
  url,
  token: tinaToken,
  queries,
});

export default client;
