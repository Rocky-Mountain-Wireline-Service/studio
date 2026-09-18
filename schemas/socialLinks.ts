import { defineType, defineField } from 'sanity';
import { createElement } from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaGithub,
  FaPinterestP,
  FaThreads,
  FaBluesky,
  FaMastodon,
  FaGlobe,
  FaXTwitter,
} from 'react-icons/fa6';

const PLATFORMS = [
  { title: 'Facebook', value: 'facebook' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'X (Twitter)', value: 'twitter' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'TikTok', value: 'tiktok' },
  { title: 'GitHub', value: 'github' },
  { title: 'Pinterest', value: 'pinterest' },
  { title: 'Threads', value: 'threads' },
  { title: 'Bluesky', value: 'bluesky' },
  { title: 'Mastodon', value: 'mastodon' },
  { title: 'Other', value: 'other' },
];

const PLATFORM_ICON_MAP: Record<string, React.ComponentType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  twitter: FaXTwitter,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  github: FaGithub,
  pinterest: FaPinterestP,
  threads: FaThreads,
  bluesky: FaBluesky,
  mastodon: FaMastodon,
  other: FaGlobe,
};

export default defineType({
  name: 'socialLinks',
  title: 'Social Links',
  type: 'document',
  icon: FaGlobe,
  fields: [
    defineField({
      name: 'links',
      title: ' ',
      description: 'Add your social media profiles. These appear in the site footer.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: PLATFORMS,
                layout: 'dropdown',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Profile URL',
              type: 'url',
              validation: (Rule) =>
                Rule.required().uri({ scheme: ['http', 'https'] }),
            }),
          ],
          preview: {
            select: { platform: 'platform', url: 'url' },
            prepare({ platform, url }) {
              const label =
                PLATFORMS.find((p) => p.value === platform)?.title || platform || 'New link';
              const IconComponent = PLATFORM_ICON_MAP[platform] || FaGlobe;
              return {
                title: label,
                subtitle: url || 'No URL set',
                media: () => createElement(IconComponent),
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { links: 'links' },
    prepare({ links }) {
      const count = Array.isArray(links) ? links.length : 0;
      return {
        title: 'Social Links',
        subtitle: count ? `${count} link${count === 1 ? '' : 's'}` : 'No links added',
      };
    },
  },
});
