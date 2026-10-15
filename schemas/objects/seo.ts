import { defineType, defineField } from 'sanity';

/**
 * Per-document search/social metadata.
 *
 * The old site hardcoded every meta description in a map inside the frontend,
 * which meant the client could not touch their own search results. Attaching
 * this to each document hands that back to them; the frontend falls back to
 * generated copy when a field is blank, so leaving it empty is always safe.
 */
export default defineType({
  name: 'seo',
  title: 'Search & Social',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'title',
      title: 'Search Result Title',
      description:
        'Shown as the clickable headline in Google. Leave blank to use the page title. "- Rocky Mountain Wireline Service" is appended automatically.',
      type: 'string',
      validation: (Rule) => Rule.max(60).warning('Google truncates past roughly 60 characters.'),
    }),
    defineField({
      name: 'description',
      title: 'Search Result Description',
      description:
        'The gray summary text under the headline in Google. Aim for 120-155 characters.',
      type: 'text',
      rows: 3,
      validation: (Rule) =>
        Rule.max(155).warning('Google truncates past roughly 155 characters.'),
    }),
    defineField({
      name: 'image',
      title: 'Social Share Image',
      description:
        'Shown when the page is shared on Facebook, LinkedIn or X. Ideally 1200x630. Falls back to the page hero, then the site default.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      description: 'Leave off unless you specifically want this page kept out of Google.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
