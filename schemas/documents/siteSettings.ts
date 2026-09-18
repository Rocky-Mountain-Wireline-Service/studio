import { defineType, defineField } from 'sanity';
import { IoSettingsSharp } from 'react-icons/io5';

/**
 * Site-wide identity: logos, business name, default social image, developer
 * credit. One document, edited in place.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: IoSettingsSharp,
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'logos', title: 'Logos' },
    { name: 'seo', title: 'Search defaults' },
    { name: 'credit', title: 'Footer credit' },
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Business name',
      type: 'string',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'One-line description of the business, used in the footer.',
      type: 'text',
      rows: 3,
      group: 'identity',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright line',
      description: 'The year is added automatically — just the wording here.',
      type: 'string',
      group: 'identity',
    }),
    defineField({
      name: 'logo',
      title: 'Primary logo',
      type: 'figure',
      group: 'logos',
    }),
    defineField({
      name: 'mobileLogo',
      title: 'Compact logo',
      description: 'Optional. Used in the mobile header where the full logo will not fit.',
      type: 'figure',
      group: 'logos',
    }),
    defineField({
      name: 'footerLogo',
      title: 'Footer logo',
      description: 'Optional. Falls back to the primary logo.',
      type: 'figure',
      group: 'logos',
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default search & social',
      description:
        'Used for any page that has not set its own. The social image here is the sitewide fallback.',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'developerCredit',
      title: 'Credit text',
      description: 'e.g. "Designed & developed by Phifer Web Solutions"',
      type: 'string',
      group: 'credit',
    }),
    defineField({
      name: 'developerUrl',
      title: 'Credit link',
      type: 'url',
      group: 'credit',
    }),
  ],
  preview: {
    select: { title: 'siteName', media: 'logo' },
    prepare({ title, media }: any) {
      return { title: title || 'Site Settings', subtitle: 'Site Settings', media };
    },
  },
});
