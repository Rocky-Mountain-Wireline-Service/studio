import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { iconPicker } from 'sanity-plugin-icon-picker';
import { schemaTypes } from './schemas';

// Types where clients can only edit existing documents, not create or delete
const LOCKED_TYPES = ['page', 'legalPage', 'siteSettings', 'socialLinks', 'navigation'];

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!;

const sharedConfig = {
  projectId,
  plugins: [structureTool(), iconPicker()],
  schema: { types: schemaTypes },
  document: {
    actions: (prev: any[], context: { schemaType: string }) => {
      if (LOCKED_TYPES.includes(context.schemaType)) {
        return prev.filter(
          (action: { action?: string }) => !['create', 'delete', 'duplicate'].includes(action.action ?? '')
        );
      }
      return prev;
    },
    newDocumentOptions: (prev: { templateId: string }[]) => {
      return prev.filter((opt) => !LOCKED_TYPES.includes(opt.templateId));
    },
  },
};

export default defineConfig([
  {
    ...sharedConfig,
    name: 'production',
    title: 'Rocky Mountain Wireline Service',
    dataset: 'production',
    basePath: '/production',
  },
  {
    ...sharedConfig,
    name: 'staging',
    title: 'Rocky Mountain Wireline Service (Staging)',
    dataset: 'staging',
    basePath: '/staging',
  },
]);
