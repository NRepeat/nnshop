import { defineArrayMember, defineField, defineType } from 'sanity';

export const popularPosts = defineType({
  name: 'popularPosts',
  title: 'Popular Posts',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    }),
    defineField({
      name: 'posts',
      title: 'Posts',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'post' }] })],
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return {
        title: title?.uk || title?.ru || 'Popular Posts',
        subtitle: 'Popular Posts block',
      };
    },
  },
});
