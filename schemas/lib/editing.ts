import { defineArrayMember } from 'sanity';

/**
 * Shared editing rules for the Studio.
 */

type CurrentUser = { roles?: { name: string }[] } | null | undefined;

/**
 * True for project administrators (the web team). Settings that only the web
 * team should change — URL paths, internal field names, the developer credit,
 * spam tuning — are read-only or hidden for everyone else, so a client editor
 * cannot break a page by tidying up a field that looks harmless.
 */
export const isAdmin = (user: CurrentUser) => Boolean(user?.roles?.some((r) => r.name === 'administrator'));

export const adminOnlyEdit = ({ currentUser }: { currentUser?: CurrentUser }) => !isAdmin(currentUser);
export const adminOnlyView = ({ currentUser }: { currentUser?: CurrentUser }) => !isAdmin(currentUser);

/**
 * The text editor's toolbar, limited to what the site actually styles.
 *
 * Sanity's default offers six heading levels; the site's page title is already
 * the h1, and body copy is designed for three heading sizes at most. Offering
 * H1 or H5 would let a well-meant edit produce text the site renders badly and
 * search engines read as a second page title.
 *
 *   richText()                  paragraphs, headings, lists, quote, bold, italic, links
 *   richText({ headings: false }) for short copy: intros, card text, the footer blurb
 */
export function richText({ headings = true }: { headings?: boolean } = {}) {
  return [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        ...(headings
          ? [
              { title: 'Heading', value: 'h2' },
              { title: 'Subheading', value: 'h3' },
              { title: 'Small heading', value: 'h4' },
              { title: 'Quote', value: 'blockquote' },
            ]
          : []),
      ],
      lists: [
        { title: 'Bulleted list', value: 'bullet' },
        { title: 'Numbered list', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'string',
                title: 'Link to',
                description: 'A page on this site such as /contact, a full https:// address, or mailto:/tel:',
                validation: (Rule: any) =>
                  Rule.required().custom((value?: string) =>
                    !value || /^(\/|https?:\/\/|mailto:|tel:)/.test(value)
                      ? true
                      : 'Start with / for a page on this site, or https://, mailto: or tel:'
                  ),
              },
            ],
          },
        ],
      },
    }),
  ];
}
