import { defineCliConfig } from 'sanity/cli';

// Default to `staging`, never `production`. CLI commands here can write
// (`sanity exec seed.ts`, `dataset import`), and production is the live site —
// an unset env var should fail safe, not aim at the customer-facing dataset.
// Target production explicitly: SANITY_STUDIO_DATASET=production npx sanity ...
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'staging',
  },
});
