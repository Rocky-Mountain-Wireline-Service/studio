import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'footerColumns',
  title: 'Footer Columns',
  type: 'document',
  fields: [
    defineField({
      name: 'columns',
      title: 'Column groups with title and links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'footerColumn',
          fields: [
            defineField({
              name: 'title',
              title: 'Column Title',
              type: 'string',
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'navLink',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                    }),
                    defineField({
                      name: 'url',
                      title: 'URL',
                      type: 'string',
                    })
                  ],
                }
              ],
            })
          ],
        }
      ],
      validation: Rule => Rule.required(),
    }),
  ],
});
