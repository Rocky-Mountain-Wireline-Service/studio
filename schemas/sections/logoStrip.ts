import { defineType, defineField } from 'sanity';

/**
 * Accreditation / partner logo row — the Equipment page's "Trusted By"
 * (ISN, PEC, SafeLand USA).
 *
 * These logos were hardcoded as bundled PNG imports on the old site, so adding
 * or dropping an accreditation meant a code change and a deploy. They belong to
 * the client, so they belong in the CMS.
 */
export default defineType({
  name: 'logoStrip',
  title: 'Logo Strip',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section heading',
      type: 'string',
      initialValue: 'Trusted By',
    }),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'partnerLogo',
          fields: [
            defineField({
              name: 'name',
              title: 'Organisation name',
              description: 'Used as the alt text and as the link title.',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'logo',
              title: 'Logo',
              type: 'image',
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Links to',
              description: 'Optional.',
              type: 'url',
            }),
          ],
          preview: { select: { title: 'name', media: 'logo' } },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { heading: 'heading', logos: 'logos' },
    prepare({ heading, logos }: any) {
      const count = logos?.length ?? 0;
      return {
        title: heading || 'Logo Strip',
        subtitle: `Logos — ${count}`,
      };
    },
  },
});
