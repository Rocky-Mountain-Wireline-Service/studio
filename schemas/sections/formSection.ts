import { defineType, defineField } from 'sanity';

/**
 * Drops a form defined in "Forms" onto a page.
 *
 * The form's fields, recipient and success message live on the form document,
 * so the same form can appear on more than one page and changing it does not
 * mean touching every page that uses it.
 */
export default defineType({
  name: 'formSection',
  title: 'Form',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Section heading', type: 'string' }),
    defineField({
      name: 'intro',
      title: 'Intro copy',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'tone',
      title: 'Appearance',
      description:
        'Brand suits a short, high-intent form like a sales enquiry, where the colour carries weight. Light suits a long one like a job application, where a calmer ground is easier to work through.',
      type: 'string',
      options: {
        list: [
          { title: 'Brand (red card)', value: 'brand' },
          { title: 'Light (white card)', value: 'light' },
        ],
        layout: 'radio',
      },
      initialValue: 'brand',
    }),
    defineField({
      name: 'form',
      title: 'Which form',
      type: 'reference',
      to: [{ type: 'dynamicForm' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { heading: 'heading', formTitle: 'form.title' },
    prepare({ heading, formTitle }: any) {
      return {
        title: heading || formTitle || 'Form',
        subtitle: formTitle ? `Form — ${formTitle}` : 'Form',
      };
    },
  },
});
