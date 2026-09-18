import { defineType, defineField } from 'sanity';

/**
 * Department heads and branch contacts.
 *
 * Every field below `name` is optional by design: the live data has three
 * different shapes across its five entries — some carry a region, some a street
 * address, some neither — and forcing them into one rigid shape would mean
 * inventing data the client never supplied.
 */
export default defineType({
  name: 'staffDirectory',
  title: 'Staff Directory',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Section heading', type: 'string' }),
    defineField({
      name: 'people',
      title: 'People',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'staffMember',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'jobTitle',
              title: 'Job title',
              description: 'e.g. "District Manager"',
              type: 'string',
            }),
            defineField({
              name: 'department',
              title: 'Department or tag',
              description: 'Small label shown above the name.',
              type: 'string',
            }),
            defineField({
              name: 'region',
              title: 'Region',
              description: 'Optional. Which area this person covers.',
              type: 'string',
            }),
            defineField({ name: 'email', title: 'Email', type: 'string' }),
            defineField({ name: 'phone', title: 'Phone', type: 'string' }),
            defineField({ name: 'streetAddress', title: 'Street address', type: 'string' }),
            defineField({
              name: 'cityState',
              title: 'City & state',
              type: 'string',
            }),
          ],
          preview: {
            select: { name: 'name', jobTitle: 'jobTitle', region: 'region' },
            prepare({ name, jobTitle, region }: any) {
              return {
                title: name || 'Unnamed',
                subtitle: [jobTitle, region].filter(Boolean).join(' — '),
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { heading: 'heading', people: 'people' },
    prepare({ heading, people }: any) {
      const count = people?.length ?? 0;
      return { title: heading || 'Staff Directory', subtitle: `Staff — ${count}` };
    },
  },
});
