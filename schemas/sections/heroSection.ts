import { defineType, defineField } from 'sanity';

/**
 * Full-bleed page header. Every legacy page document carried the same
 * `image` + `headeralt` + `title` trio; this is that pattern, named.
 */
export default defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro copy',
      description: 'Optional paragraph shown beneath the headline.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'image',
      title: 'Background image',
      description: 'Optional. A brand gradient is used when this is empty.',
      type: 'figure',
    }),
    defineField({
      name: 'cta',
      title: 'Call-to-action button',
      type: 'link',
    }),
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare({ title, media }: any) {
      return { title: title || 'Hero', subtitle: 'Hero', media };
    },
  },
});
