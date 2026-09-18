import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { iconPicker } from 'sanity-plugin-icon-picker';
import { schemaTypes } from './schemas';
import { structure, singletonTypes } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!;

// One workspace, one dataset, chosen by environment — mirroring the branch model:
//   sandbox branch    -> staging dataset
//   production branch -> production dataset
// Declaring both datasets as sibling workspaces would put the live site one
// click away from an accidental edit, and Sanity's auth config is project-scoped
// so the second workspace's auth settings are a silent no-op anyway.
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'staging';
const isProduction = dataset === 'production';

/**
 * Types that map onto fixed frontend routes. The client edits these but must
 * not create or delete them: a second `page` would have nowhere to render, and
 * deleting one would 404 a URL that is already indexed.
 */
const FIXED_TYPES = ['page', 'legalPage', 'navigation', ...singletonTypes];

export default defineConfig({
  name: 'default',
  title: isProduction
    ? 'Rocky Mountain Wireline Service'
    : `Rocky Mountain Wireline Service (${dataset})`,
  projectId,
  dataset,
  basePath: '/',
  plugins: [structureTool({ structure }), iconPicker()],
  schema: { types: schemaTypes },
  document: {
    actions: (prev, context) =>
      FIXED_TYPES.includes(context.schemaType)
        ? prev.filter((action) => !['create', 'delete', 'duplicate'].includes(action.action ?? ''))
        : prev,
    newDocumentOptions: (prev) => prev.filter((opt) => !FIXED_TYPES.includes(opt.templateId)),
  },
});
