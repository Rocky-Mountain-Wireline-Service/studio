import { defineType, defineField } from 'sanity';
import { MdOutlineDynamicForm } from 'react-icons/md';
import { adminOnlyEdit, adminOnlyView } from '../lib/editing';

export default defineType({
  name: 'dynamicForm',
  title: 'Form',
  type: 'document',
  icon: MdOutlineDynamicForm,
  fields: [
    defineField({
      name: 'title',
      title: 'Form name',
      description: 'Also the subject line of the email each submission sends, and how it is labeled in the dashboard.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Internal ID',
      description: 'Set by the web team.',
      type: 'slug',
      readOnly: adminOnlyEdit,
      hidden: adminOnlyView,
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Accepting submissions',
      description: 'Turn off to hide the form from the website without deleting it.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'description',
      title: 'Short note above the form',
      description: 'Optional. Shown under the form heading.',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'fields',
      title: 'Questions',
      description: 'Drag to reorder. Each becomes one box or choice on the form.',
      type: 'array',
      of: [{
        type: 'object',
        name: 'formField',
        fields: [
          defineField({
            name: 'label',
            title: 'Question',
            description: 'What the visitor sees, e.g. "Mobile Phone".',
            type: 'string',
            validation: (Rule) => Rule.required(),
          }),
          defineField({
            name: 'name',
            title: 'Internal name',
            description:
              'Set by the web team. A short key with no spaces, e.g. "phone". The dashboard uses it to find the name, email and phone in each submission, so it must not change once submissions exist.',
            type: 'string',
            readOnly: ({ parent, currentUser }: any) => Boolean(parent?.name) && adminOnlyEdit({ currentUser }),
            validation: (Rule) =>
              Rule.required().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, { name: 'letters, numbers and underscores' }),
          }),
          defineField({
            name: 'type',
            title: 'Answer type',
            type: 'string',
            options: {
              list: [
                { title: 'Short text', value: 'text' },
                { title: 'Long text (several lines)', value: 'textarea' },
                { title: 'Email address', value: 'email' },
                { title: 'Phone number', value: 'phone' },
                { title: 'Number', value: 'number' },
                { title: 'Date', value: 'date' },
                { title: 'Dropdown (pick one)', value: 'select' },
                { title: 'Buttons (pick one)', value: 'radio' },
                { title: 'Tick boxes (pick any)', value: 'checkbox-group' },
                { title: 'Single tick box', value: 'checkbox' },
                { title: 'File upload', value: 'file' },
              ],
            },
            initialValue: 'text',
          }),
          defineField({ name: 'required', title: 'Must be answered', type: 'boolean', initialValue: false }),
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
            title: 'Choices',
            description: 'One per line. Only used by dropdowns, buttons and tick boxes.',
            type: 'array',
            of: [{ type: 'string' }],
            hidden: ({ parent }: any) => !['select', 'radio', 'checkbox-group'].includes(parent?.type),
          }),
        ],
        preview: {
          select: { title: 'label', type: 'type', required: 'required' },
          prepare({ title, type, required }: any) {
            return { title: `${title || 'Untitled question'}${required ? ' *' : ''}`, subtitle: type };
          },
        },
      }],
    }),
    defineField({
      name: 'spamProtection',
      title: 'Spam protection',
      description: 'Both defences are invisible to real visitors. Leave them on unless a legitimate submission is being blocked.',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      hidden: adminOnlyView,
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
    defineField({
      name: 'successMessage',
      title: 'Thank-you message',
      description: 'Shown in place of the form after someone sends it.',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'notifyEmail',
      title: 'Send submissions to',
      description:
        'The email address that receives each submission. Every submission is also kept in the dashboard under Form Submissions.',
      type: 'string',
      validation: (Rule) =>
        Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: 'email address' }).error('Enter one email address.'),
    }),
  ],
  preview: {
    select: { title: 'title', active: 'active', fields: 'fields' },
    prepare({ title, active, fields }: any) {
      const count = fields?.length ?? 0;
      return {
        title: title || 'Form',
        subtitle: `${active === false ? 'Off' : 'Accepting submissions'} · ${count} question${count === 1 ? '' : 's'}`,
      };
    },
  },
});
