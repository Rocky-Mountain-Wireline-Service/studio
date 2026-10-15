import { defineType, defineField } from 'sanity';
import { richText } from '../lib/editing';
import { MdOutlineWebAsset } from 'react-icons/md';

/**
 * Footer content that is not a link list — the mission blurb, column headings
 * and the contact cards.
 *
 * Footer *links* live in `navigation` documents (navType "footer" and "legal")
 * so that every link on the site is edited the same way, in one place.
 */
export default defineType({
  name: 'footerSettings',
  title: 'Footer',
  type: 'document',
  icon: MdOutlineWebAsset,
  fields: [
    defineField({
      name: 'mission',
      title: 'Mission blurb',
      description: 'Short paragraph shown beside the footer logo.',
      type: 'array',
      of: richText({ headings: false }),
    }),
    defineField({
      name: 'linksHeading',
      title: 'Heading above the links column',
      type: 'string',
      initialValue: 'Quick Links',
    }),
    defineField({
      name: 'contactHeading',
      title: 'Heading above the contact column',
      type: 'string',
      initialValue: 'Contact',
    }),
    defineField({
      name: 'contactCards',
      title: 'Contact details',
      description: 'Phone, email and address shown in the footer.',
      type: 'contactCards',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Footer', subtitle: 'Footer content' };
    },
  },
});
