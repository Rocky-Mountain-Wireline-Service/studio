import { defineType, defineField } from 'sanity';
import { MdOutlineFlag } from 'react-icons/md';
import { richText } from '../lib/editing';

/**
 * Icon + heading + statement cards.
 *
 * The legacy schema had `mission` and `vision` as two separate array types with
 * byte-identical field shapes (icon, title, statement) differing only in field
 * names. One type with many entries replaces both, and the About page keeps
 * rendering exactly as it does today.
 */
export default defineType({
  name: 'statementCards',
  title: 'Statement Cards',
  type: 'object',
  icon: MdOutlineFlag,
  fields: [
    defineField({ name: 'heading', title: 'Section heading', type: 'string' }),
    defineField({
      name: 'cards',
      title: 'Cards',
      description: 'Mission, vision, values — one card each.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'statementCard',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'statement',
              title: 'Statement',
              type: 'array',
              of: richText({ headings: false }),
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'icon', title: 'Icon', type: 'figure' }),
          ],
          preview: {
            select: { title: 'title', media: 'icon' },
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
        title: heading || 'Statement Cards',
        subtitle: `Statements — ${count} card${count === 1 ? '' : 's'}`,
      };
    },
  },
});
