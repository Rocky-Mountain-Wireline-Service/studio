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
      name: 'headerCta',
      title: 'Header button',
      description:
        'The button at the top right of every page. Point it at /contact#contact-form to land on the contact form itself.',
      type: 'link',
      group: 'identity',
    }),
    defineField({
      name: 'logo',
      title: 'Primary logo',
      description:
        'Shown in the site header. A wide, horizontal version works best here — the header is only about 40px tall.',
      type: 'figure',
      group: 'logos',
    }),
    defineField({
      name: 'mobileLogo',
      title: 'Compact logo',
      description:
        'Optional. Used in the mobile header, where a wide logo becomes unreadably small. A square or stacked mark works best.',
      type: 'figure',
      group: 'logos',
    }),
    defineField({
      name: 'footerLogo',
      title: 'Footer logo',
      description:
        'Optional — falls back to the primary logo. The footer is dark, so a light or reversed version reads best here.',
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
