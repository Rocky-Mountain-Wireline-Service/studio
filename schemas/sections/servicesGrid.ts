import { defineType, defineField } from 'sanity';
import { MdOutlineGridView } from 'react-icons/md';
import { richText } from '../lib/editing';

/**
 * The services index. References `servicePage` documents rather than copying
 * their titles and links, so renaming a service or changing its slug updates
 * the grid and the detail page together — the legacy schema stored the link as
 * a hand-typed string and the two could silently diverge.
 *
 * Leave `services` empty to list every service automatically; fill it in only
 * to pin a specific order or show a subset.
 */
export default defineType({
  name: 'servicesGrid',
  title: 'Services Grid',
  type: 'object',
  icon: MdOutlineGridView,
  fields: [
    defineField({ name: 'heading', title: 'Section heading', type: 'string' }),
    defineField({
      name: 'intro',
      title: 'Intro copy',
      type: 'array',
      of: richText({ headings: false }),
    }),
    defineField({
      name: 'services',
      title: 'Services to show',
      description:
        'Leave empty to show every service in alphabetical order. Add entries here to control which appear and in what order.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'servicePage' }] }],
    }),
  ],
  preview: {
    select: { heading: 'heading', services: 'services' },
    prepare({ heading, services }: any) {
      const count = services?.length ?? 0;
      return {
        title: heading || 'Services Grid',
        subtitle: count ? `Services — ${count} pinned` : 'Services — all, alphabetical',
      };
    },
  },
});
