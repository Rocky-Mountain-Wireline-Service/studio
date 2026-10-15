import { defineType, defineField } from 'sanity';
import { MdOutlinePlace } from 'react-icons/md';

/**
 * Branch locations with phone numbers. Feeds both the on-page list and the
 * LocalBusiness structured data — the old site hardcoded a single address in
 * the frontend's JSON-LD, which misrepresented a multi-branch company to
 * search engines.
 */
export default defineType({
  name: 'locationsSection',
  title: 'Locations',
  type: 'object',
  icon: MdOutlinePlace,
  fields: [
    defineField({ name: 'heading', title: 'Section heading', type: 'string' }),
    defineField({
      name: 'locations',
      title: 'Branches',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'location',
          fields: [
            defineField({
              name: 'city',
              title: 'City',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'state',
              title: 'State',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'phone',
              title: 'Phone',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'streetAddress',
              title: 'Street address',
              description: 'Optional, but needed for this branch to appear in local search results.',
              type: 'string',
            }),
            defineField({ name: 'postalCode', title: 'ZIP code', type: 'string' }),
          ],
          preview: {
            select: { city: 'city', state: 'state', phone: 'phone' },
            prepare({ city, state, phone }: any) {
              return { title: [city, state].filter(Boolean).join(', '), subtitle: phone };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { heading: 'heading', locations: 'locations' },
    prepare({ heading, locations }: any) {
      const count = locations?.length ?? 0;
      return {
        title: heading || 'Locations',
        subtitle: `Locations — ${count} branch${count === 1 ? '' : 'es'}`,
      };
    },
  },
});
