/**
 * Tina CLI always regenerates `tina/__generated__/client.ts` with the token
 * inlined. We use `src/lib/tina-graphql-client.ts` instead; delete the
 * generated file so Netlify secrets scanning does not flag it.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "tina", "__generated__", "client.ts");

if (fs.existsSync(target)) {
  fs.rmSync(target, { force: true });
}
