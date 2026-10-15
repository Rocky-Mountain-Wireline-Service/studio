import { defineType, defineField } from 'sanity';
import { HiDocumentText } from 'react-icons/hi2';
import { sectionMembers } from '../sections';
import { adminOnlyEdit } from '../lib/editing';

/**
 * Any composed page: Home, About, Services, Equipment, Safety, Employment,
 * Contact. Content is a list of sections the client can reorder.
 *
 * Service *detail* pages are `servicePage` documents instead — they share a
 * fixed layout and are generated from a single template, so giving each one a
 * free-form section list would invite six pages that drift out of step.
 */
export default defineType({
  name: 'page',
  title: 'Pages',
  type: 'document',
  icon: HiDocumentText,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'Search & Social' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL path',
      description:
        'Set by the web team. Each page has a fixed address the site is built around, so this cannot be changed here.',
      readOnly: adminOnlyEdit,
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
        // Preserve the leading slash the frontend routes on; Sanity's default
        // slugifier strips it, which would silently break every page link.
        slugify: (input: string) =>
          '/' +
          input
            .toLowerCase()
            .trim()
            .replace(/^\/+/, '')
            .replace(/[^a-z0-9/]+/g, '-')
            .replace(/(^-|-$)/g, ''),
      },
      validation: (Rule) =>
        Rule.required().custom((slug?: { current?: string }) =>
          slug?.current?.startsWith('/') ? true : 'The path must start with "/"'
        ),
    }),
    defineField({
      name: 'sections',
      title: 'Page sections',
      description: 'Add sections and drag to reorder. Each carries its own content.',
      type: 'array',
      group: 'content',
      of: sectionMembers,
    }),
    defineField({ name: 'seo', title: 'Search & Social', type: 'seo', group: 'seo' }),
  ],
  preview: {
    // The page's hero photograph as its thumbnail: the list is scanned by eye.
    select: { title: 'title', slug: 'slug.current', sections: 'sections', media: 'sections.0.image' },
    prepare({ title, slug, sections, media }: any) {
      const count = sections?.length ?? 0;
      return {
        title: title || 'Untitled',
        subtitle: `${slug || '—'} · ${count} section${count === 1 ? '' : 's'}`,
        media,
      };
    },
  },
});
