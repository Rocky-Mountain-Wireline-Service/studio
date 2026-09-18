import { defineType, defineField } from 'sanity';

/**
 * One navigable link. Used by navigation, footer columns and every CTA button,
 * so a change to how links work happens in exactly one place.
 */
export default defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Text',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Destination',
      description: 'An internal path such as /services, or a full https:// address.',
      type: 'string',
      validation: (Rule) =>
        Rule.required().custom((value?: string) => {
          if (!value) return true;
          if (value.startsWith('/')) return true;
          if (/^https?:\/\//.test(value)) return true;
          if (/^(mailto|tel):/.test(value)) return true;
          return 'Use an internal path (/services), a full URL (https://...), or mailto:/tel:';
        }),
    }),
    defineField({
      name: 'isExternal',
      title: 'Open in a new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'href' },
  },
});
