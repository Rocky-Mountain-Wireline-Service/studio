import { defineType, defineField } from 'sanity';
import { RiPagesLine } from 'react-icons/ri';

/**
 * One wireline service, rendered at /services/<slug>.
 *
 * `servicesGrid` references these, so the index and the detail pages cannot
 * fall out of step — the legacy schema stored the grid's link as a typed string
 * beside a separate service document and nothing kept the two honest.
 */
export default defineType({
  name: 'servicePage',
  title: 'Services',
  type: 'document',
  icon: RiPagesLine,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'Search & Social' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Service name',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      description: 'The part after /services/. Changing this breaks existing links.',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Card summary',
      description:
        'Short description shown on the services index. Also used as the search description when Search & Social is left blank.',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'image',
      title: 'Header image',
      type: 'figure',
      group: 'content',
    }),
    defineField({
      name: 'content',
      title: 'Body copy',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({ name: 'seo', title: 'Search & Social', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', media: 'image' },
    prepare({ title, slug, media }: any) {
      return { title: title || 'Untitled', subtitle: slug ? `/services/${slug}` : '—', media };
    },
  },
});
