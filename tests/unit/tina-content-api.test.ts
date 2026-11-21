import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  cliGraphqlPackageVersion,
  contentApiVersionFromPackageVersion,
  tinaCloudContentUrl,
} from "../../src/lib/tina-content-api";

describe("Tina content API version", () => {
  it("uses major.minor from the @tinacms/graphql package, matching the admin build", () => {
    expect(contentApiVersionFromPackageVersion("4.1.0")).toBe("4.1");
    expect(contentApiVersionFromPackageVersion("2.2.3")).toBe("2.2");
  });

  it("points production content fetches at the GraphQL version installed with the CLI", () => {
    const graphqlVersion = cliGraphqlPackageVersion();
    const [major, minor] = graphqlVersion.split(".");
    expect(
      tinaCloudContentUrl("client-id", "main")
    ).toBe(
      `https://content.tinajs.io/${major}.${minor}/content/client-id/github/main`
    );
  });

  it("does not keep the pre-upgrade 2.2 content API path in the Astro client", () => {
    const source = readFileSync(
      new URL("../../src/lib/tina-graphql-client.ts", import.meta.url),
      "utf8"
    );
    expect(source).not.toContain("/2.2/content/");
    expect(source).toContain("tinaCloudContentUrl");
  });
});
