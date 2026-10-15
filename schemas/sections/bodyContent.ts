import { defineType, defineField } from 'sanity';
import { MdOutlineArticle } from 'react-icons/md';
import { richText } from '../lib/editing';

/**
 * Rich text with an optional supporting image. This is the workhorse: About,
 * Equipment, Safety, Services and Employment all reduce to it, replacing the
 * legacy `content` + `bodyimage` + `bodyalt` field trio.
 */
export default defineType({
  name: 'bodyContent',
  title: 'Text & Image',
  type: 'object',
  icon: MdOutlineArticle,
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'body',
      title: 'Body copy',
      type: 'array',
      of: richText(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Supporting image',
      description: 'Optional. When empty the text runs full width.',
      type: 'figure',
    }),
    defineField({
      name: 'imageRight',
      title: 'Place image on the right',
      description: 'Ignored on narrow screens, where the image always sits above the text.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'heading', media: 'image', body: 'body' },
    prepare({ title, media, body }: any) {
      const firstLine = body?.[0]?.children?.[0]?.text;
      return {
        title: title || firstLine?.slice(0, 50) || 'Text & Image',
        subtitle: 'Text & Image',
        media,
      };
    },
  },
});
