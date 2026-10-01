import { defineType, defineField } from 'sanity';

/**
 * Hosts whose embeds may be framed.
 *
 * An <iframe> whose src is editor-supplied is an injection vector: whatever is
 * pasted here runs in a frame on the site. Restricting it to known map
 * providers keeps the field useful without letting a mistyped or malicious URL
 * put arbitrary content on the page.
 */
const ALLOWED_HOSTS = [
  'www.google.com',
  'maps.google.com',
  'google.com',
  'www.openstreetmap.org',
  'openstreetmap.org',
];

export default defineType({
  name: 'mapEmbed',
  title: 'Map',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Section heading', type: 'string' }),
    defineField({
      name: 'embedUrl',
      title: 'Map embed URL',
      description:
        'From Google Maps: Share → Embed a map → copy the src="..." value. Only Google Maps and OpenStreetMap embeds are accepted.',
      type: 'url',
      validation: (Rule) =>
        Rule.required().custom((value?: string) => {
          if (!value) return true;
          let url: URL;
          try {
            url = new URL(value);
          } catch {
            return 'That is not a valid URL.';
          }
          if (url.protocol !== 'https:') return 'The embed URL must use https.';
          if (!ALLOWED_HOSTS.includes(url.hostname)) {
            return `Only maps from ${ALLOWED_HOSTS.join(', ')} can be embedded.`;
          }
          return true;
        }),
    }),
    defineField({
      name: 'label',
      title: 'Accessible description',
      description:
        'What the map shows, e.g. "Map of the Grand Junction office". Read aloud by screen readers, which cannot interpret the map itself.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'height',
      title: 'Map height',
      type: 'string',
      options: {
        list: [
          { title: 'Short', value: 'short' },
          { title: 'Medium', value: 'medium' },
          { title: 'Tall', value: 'tall' },
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    }),
  ],
  preview: {
    select: { heading: 'heading', label: 'label' },
    prepare({ heading, label }: any) {
      return { title: heading || label || 'Map', subtitle: 'Map' };
    },
  },
});
