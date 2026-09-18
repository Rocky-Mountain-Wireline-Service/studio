import { defineType, defineField } from 'sanity';
import { HiScale } from 'react-icons/hi2';

/**
 * Privacy Policy, Terms & Conditions, and any other legal copy.
 *
 * Kept apart from `page` because these are a single block of prose with a
 * revision date, never a composed layout — and because the frontend's legal
 * routes query this type by slug.
 */
export default defineType({
  name: 'legalPage',
  title: 'Legal Pages',
  type: 'document',
  icon: HiScale,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'Search & Social' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL path',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      description: 'Shown at the top of the page. Update this whenever the text changes.',
      type: 'date',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'seo', title: 'Search & Social', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', lastUpdated: 'lastUpdated' },
    prepare({ title, slug, lastUpdated }: any) {
      return {
        title: title || 'Untitled',
        subtitle: [slug, lastUpdated && `updated ${lastUpdated}`].filter(Boolean).join(' · '),
      };
    },
  },
});
