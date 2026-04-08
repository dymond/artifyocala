/** @type {import('@lhci/cli').LHCIConfig} */
module.exports = {
  ci: {
    collect: {
      /**
       * Production-like:
       * - Build with NETLIFY=true so astro.config.mjs enables minify + HTML compression.
       * - Serve the built output via astro preview.
       *
       * This is ONLY run when you invoke pnpm run audit:lighthouse / verify:predeploy.
       */
      startServerCommand:
        'NETLIFY=true pnpm exec astro build && pnpm exec astro preview --host 127.0.0.1 --port 4321',
      startServerReadyPattern: '127\\.0\\.0\\.1:4321',
      startServerReadyTimeout: 60000,
      url: [
        'http://127.0.0.1:4321/',
        'http://127.0.0.1:4321/about/',
        'http://127.0.0.1:4321/donate/',
        'http://127.0.0.1:4321/volunteer/',
      ],
      numberOfRuns: 2,
      settings: {
        emulatedFormFactor: 'mobile',
        throttlingMethod: 'simulate',
        chromeFlags: ['--headless=new', '--no-sandbox'],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
    assert: {
      assertions: {
        // Start informational; tighten once we have a baseline.
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        // Local preview runs over http://127.0.0.1, so best-practices is artificially lower (HTTPS audit).
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
  },
};

