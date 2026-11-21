import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Tina content URLs use `@tinacms/graphql` major.minor, same as `tinacms build`. */
export function contentApiVersionFromPackageVersion(
  graphqlPackageVersion: string
): string {
  const match = graphqlPackageVersion.match(/^(\d+)\.(\d+)\./);
  if (!match) {
    throw new Error(
      `Cannot read @tinacms/graphql version from "${graphqlPackageVersion}"`
    );
  }
  return `${match[1]}.${match[2]}`;
}

function projectPackageJsonPath(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.parse(dir).root;
  while (dir !== root) {
    const candidate = path.join(dir, "package.json");
    if (existsSync(candidate)) {
      const pkg = JSON.parse(readFileSync(candidate, "utf8")) as {
        dependencies?: Record<string, string>;
      };
      if (pkg.dependencies?.["@tinacms/cli"]) return candidate;
    }
    dir = path.dirname(dir);
  }
  throw new Error("Could not find the project package.json");
}

/**
 * Version of `@tinacms/graphql` installed next to `@tinacms/cli`.
 * The GraphQL package has no main export, so this reads its package.json
 * from the package manager's node_modules layout (pnpm virtual store).
 */
export function cliGraphqlPackageVersion(): string {
  const require = createRequire(projectPackageJsonPath());
  const cliPackageJson = require.resolve("@tinacms/cli/package.json");
  const graphqlPackageJson = path.join(
    path.dirname(cliPackageJson),
    "..",
    "graphql",
    "package.json"
  );
  if (!existsSync(graphqlPackageJson)) {
    throw new Error(
      `Unable to locate @tinacms/graphql next to @tinacms/cli (${graphqlPackageJson})`
    );
  }
  const pkg = JSON.parse(readFileSync(graphqlPackageJson, "utf8")) as {
    name?: string;
    version?: string;
  };
  if (pkg.name !== "@tinacms/graphql" || !pkg.version) {
    throw new Error(
      `Expected @tinacms/graphql at ${graphqlPackageJson}, found ${pkg.name ?? "nothing"}`
    );
  }
  return pkg.version;
}

export function tinaCloudContentUrl(clientId: string, branch: string): string {
  const apiVersion = contentApiVersionFromPackageVersion(
    cliGraphqlPackageVersion()
  );
  return `https://content.tinajs.io/${apiVersion}/content/${clientId}/github/${branch}`;
}
