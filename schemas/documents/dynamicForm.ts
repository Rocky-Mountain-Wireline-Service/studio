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
              list: ['text', 'email', 'phone', 'number', 'date', 'select', 'checkbox', 'checkbox-group', 'textarea', 'radio', 'file'],
            },
          }),
          defineField({ name: 'required', title: 'Required', type: 'boolean', initialValue: false }),
          defineField({
            name: 'width',
            title: 'Field width',
            description:
              'Lets short fields share a row. A ZIP code beside City and State reads better than three full-width boxes, and keeps a long form from becoming a long scroll. Always full width on phones.',
            type: 'string',
            options: {
              list: [
                { title: 'Full width', value: 'full' },
                { title: 'Half width', value: 'half' },
                { title: 'Third width', value: 'third' },
              ],
              layout: 'radio',
            },
            initialValue: 'full',
          }),
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
    defineField({
      name: 'spamProtection',
      title: 'Spam protection',
      description: 'Both defences are invisible to real visitors. Leave them on unless a legitimate submission is being blocked.',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'honeypot',
          title: 'Hidden decoy field',
          description: 'Adds a field only automated bots can see. Anything that fills it in is rejected.',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'minimumSeconds',
          title: 'Minimum time to complete (seconds)',
          description: 'Submissions faster than this are rejected as automated. 0 disables the check.',
          type: 'number',
          initialValue: 3,
          validation: (Rule) => Rule.min(0).max(60),
        }),
      ],
    }),
    defineField({ name: 'successMessage', title: 'Success Message', type: 'text', rows: 2 }),
    defineField({ name: 'notifyEmail', title: 'Notify Email (staff recipient)', type: 'string' }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
