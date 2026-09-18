import { defineType, defineField } from 'sanity';

/**
 * Grid of image cards pointing anywhere on the site — the homepage's four-up
 * that links to About, Services, Equipment and Safety.
 *
 * Deliberately separate from `servicesGrid`: that one references service
 * documents and stays in step with them automatically, while this one is a
 * free-form signpost. Collapsing the two into a single fuzzy "card grid" would
 * mean neither could validate what it actually points at.
 */
export default defineType({
  name: 'linkCardGrid',
  title: 'Link Card Grid',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Section heading', type: 'string' }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'linkCard',
          fields: [
            defineField({
              name: 'title',
              title: 'Card title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Card copy',
              type: 'array',
              of: [{ type: 'block' }],
            }),
            defineField({ name: 'image', title: 'Card image', type: 'figure' }),
            defineField({
              name: 'link',
              title: 'Card links to',
              type: 'link',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'link.href', media: 'image' },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { heading: 'heading', cards: 'cards' },
    prepare({ heading, cards }: any) {
      const count = cards?.length ?? 0;
      return {
        title: heading || 'Link Card Grid',
        subtitle: `Link cards — ${count} card${count === 1 ? '' : 's'}`,
      };
    },
  },
});
