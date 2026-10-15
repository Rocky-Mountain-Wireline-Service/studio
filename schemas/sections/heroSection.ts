import { defineType, defineField } from 'sanity';
import { MdOutlineViewDay } from 'react-icons/md';
import { richText } from '../lib/editing';

/**
 * Full-bleed page header. Every legacy page document carried the same
 * `image` + `headeralt` + `title` trio; this is that pattern, named.
 */
export default defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  icon: MdOutlineViewDay,
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
      of: richText({ headings: false }),
    }),
    defineField({
      name: 'image',
      title: 'Background image',
      description: 'Optional. A brand gradient is used when this is empty.',
      type: 'figure',
    }),
    defineField({
      name: 'cta',
      title: 'Primary button',
      description: 'The main action — e.g. "Get a quote".',
      type: 'link',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary button',
      description: 'Optional second action shown beside the first — e.g. "Work with us".',
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
