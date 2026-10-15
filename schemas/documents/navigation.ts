import { defineType, defineField } from 'sanity';
import { MdMenu } from 'react-icons/md';
import { adminOnlyEdit } from '../lib/editing';

/**
 * A named set of links. `navType` is what the frontend keys on to decide where
 * a set renders — the previous schema omitted it entirely while the frontend
 * queried for it, so navigation could never populate and always fell through to
 * hardcoded defaults.
 */
export default defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: MdMenu,
  fields: [
    defineField({
      name: 'navType',
      title: 'Where this menu appears',
      type: 'string',
      readOnly: adminOnlyEdit,
      options: {
        list: [
          { title: 'Main header', value: 'main' },
          { title: 'Footer links', value: 'footer' },
          { title: 'Legal (footer bottom bar)', value: 'legal' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Links',
      description: 'Drag to reorder. Each link needs its text and where it goes, such as /about.',
      type: 'array',
      of: [{ type: 'link' }],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { navType: 'navType', items: 'items' },
    prepare({ navType, items }: any) {
      const labels: Record<string, string> = {
        main: 'Main header',
        footer: 'Footer links',
        legal: 'Legal links',
      };
      const count = items?.length ?? 0;
      return {
        title: labels[navType] || 'Navigation',
        subtitle: `${count} link${count === 1 ? '' : 's'}`,
      };
    },
  },
});
