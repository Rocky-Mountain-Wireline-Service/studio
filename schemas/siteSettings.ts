import { defineType, defineField } from 'sanity';
import { IoSettingsSharp } from 'react-icons/io5';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: IoSettingsSharp,
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name displayed in header',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Site logo (light version recommended for transparent state)',
      type: 'image',
    }),
    defineField({
      name: 'authEnabled',
      title: 'Show login / account button in header',
      type: 'boolean',
    }),
    defineField({
      name: 'description',
      title: 'Short brand description',
      type: 'text',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright text in footer',
      type: 'string',
    }),
    defineField({
      name: 'craftedBy',
      title: 'Attribution line shown beneath copyright (e.g. "Crafted by Phifer Web Solutions")',
      type: 'string',
    }),
    defineField({
      name: 'businessContact',
      title: 'Name, address, phone — rendered in footer for local SEO. All fields optional.',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
        }),
        defineField({
          name: 'value',
          title: 'Value',
          type: 'string',
        })
      ],
    }),
  ],
});
