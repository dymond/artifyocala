/**
 * Registers `client:tina` for TinaCMS visual editing (see tina-astro-starter).
 * @returns {import('astro').AstroIntegration}
 */
export default function tinaClientDirective() {
  return {
    name: "client:tina",
    hooks: {
      "astro:config:setup": ({ addClientDirective }) => {
        addClientDirective({
          name: "tina",
          entrypoint: "./astro-tina-directive/tina.js",
        });
      },
    },
  };
}
