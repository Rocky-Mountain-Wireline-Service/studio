import { defineType, defineField } from 'sanity';

/**
 * An image that cannot ship without alt text.
 *
 * The legacy schema kept alt text in a sibling string field (`headeralt`,
 * `gridalt`, `bodyalt`, `iconalt`), so the two could drift apart or the alt
 * could be forgotten entirely. Binding them into one object makes the
 * accessible description part of the image rather than an afterthought.
 */
export default defineType({
  name: 'figure',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      description:
        'Describe the image for screen readers and for when the image fails to load. Leave blank only if the image is purely decorative.',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value?: string, context?: any) => {
          if (context?.parent?.asset && !value && !context?.parent?.decorative) {
            return 'Add alt text, or tick "Decorative" below.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'decorative',
      title: 'Decorative (no alt text needed)',
      description: 'Tick this if the image carries no information a reader would miss.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
