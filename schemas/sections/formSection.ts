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
