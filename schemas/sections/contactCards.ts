import { defineType, defineField } from 'sanity';
import { MdOutlineContactPhone } from 'react-icons/md';

/**
 * Small icon + label + value cards — phone, email, address.
 *
 * Shared by the Contact page and the footer, which in the legacy schema each
 * held their own copy of the same three entries and had already drifted apart.
 * Edit once, appears in both.
 */
export default defineType({
  name: 'contactCards',
  title: 'Contact Cards',
  type: 'object',
  icon: MdOutlineContactPhone,
  fields: [
    defineField({ name: 'heading', title: 'Section heading', type: 'string' }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'contactCard',
          fields: [
            defineField({
              name: 'title',
              title: 'Label',
              description: 'e.g. "Call Us", "Email Us", "Visit Us"',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Value',
              description: 'The phone number, email address or street address itself.',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Makes the card clickable',
              description:
                'Optional. Use tel:9702701673 for phone, mailto:name@rmws.com for email, or a maps URL for an address.',
              type: 'string',
            }),
            defineField({ name: 'icon', title: 'Icon', type: 'figure' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'value', media: 'icon' },
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
      return { title: heading || 'Contact Cards', subtitle: `Contact cards — ${count}` };
    },
  },
});
