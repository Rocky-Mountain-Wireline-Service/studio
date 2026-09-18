import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'dynamicForm',
  title: 'Dynamic Form',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Form Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({
      name: 'activeDates',
      title: 'Active Date Range (optional)',
      type: 'object',
      fields: [
        defineField({ name: 'start', title: 'Start Date', type: 'datetime' }),
        defineField({ name: 'end', title: 'End Date', type: 'datetime' }),
      ],
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
    defineField({
      name: 'fields',
      title: 'Form Fields',
      type: 'array',
      of: [{
        type: 'object',
        name: 'formField',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'name', title: 'Field Name (no spaces)', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({
            name: 'type',
            title: 'Field Type',
            type: 'string',
            options: {
              list: ['text', 'email', 'phone', 'number', 'date', 'select', 'checkbox', 'checkbox-group', 'textarea'],
            },
          }),
          defineField({ name: 'required', title: 'Required', type: 'boolean', initialValue: false }),
          defineField({
            name: 'options',
            title: 'Options (for select/checkbox-group)',
            type: 'array',
            of: [{ type: 'string' }],
          }),
        ],
        preview: { select: { title: 'label', subtitle: 'type' } },
      }],
    }),
    defineField({ name: 'successMessage', title: 'Success Message', type: 'text', rows: 2 }),
    defineField({ name: 'notifyEmail', title: 'Notify Email (staff recipient)', type: 'string' }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
