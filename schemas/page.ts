import { defineType, defineField } from 'sanity';
import { HiDocumentText } from 'react-icons/hi2';
import { preview as iconPreview } from 'sanity-plugin-icon-picker';

// ─── Reusable field helpers ──────────────────────────────────────────────────

const iconPickerField = defineField({
      name: 'icon',
      title: 'Icon',
      type: 'iconPicker',
      options: { providers: ['hi', 'mdi', 'fi', 'fa'], outputFormat: 'react', storeSvg: true },
    });

// ─── Section type definitions ────────────────────────────────────────────────

const heroSection = {
  type: 'object',
  name: 'heroSection',
  title: 'Hero Section',
  fields: [
    defineField({ name: 'title', title: 'Headline', type: 'string' }),
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'text' }),
    defineField({ name: 'image', title: 'Background Image', description: 'Optional — gradient is used if empty', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'imageAlt', title: 'Background image alt text', description: 'Describe the background image for screen readers', type: 'string' }),
    defineField({
      name: 'cta',
      title: 'CTA Button',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Button Text', type: 'string' }),
        defineField({ name: 'url', title: 'Button Link', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }: { title?: string }) {
      return { title: title || 'Hero Section', subtitle: 'Hero' };
    },
  },
};

const featureGrid = {
  type: 'object',
  name: 'featureGrid',
  title: 'Feature Grid',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Feature Cards',
      type: 'array',
      of: [{
        type: 'object',
        name: 'featureItem',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string' }),
          defineField({ name: 'description', title: 'Description', type: 'text' }),
          iconPickerField,
        ],
        preview: {
          select: { title: 'title', provider: 'icon.provider', name: 'icon.name' },
          prepare({ title, provider, name }: any) {
            return { title: title || 'Untitled', media: provider && name ? iconPreview({ provider, name }) : undefined };
          },
        },
      }],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Feature Grid', subtitle: 'Features' };
    },
  },
};

const statsSection = {
  type: 'object',
  name: 'statsSection',
  title: 'Stats',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Key Metrics',
      type: 'array',
      of: [{
        type: 'object',
        name: 'statItem',
        fields: [
          defineField({ name: 'value', title: 'Number', type: 'string' }),
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'prefix', title: 'Prefix', description: 'e.g. "$"', type: 'string' }),
          defineField({ name: 'suffix', title: 'Suffix', description: 'e.g. "+" or "%"', type: 'string' }),
        ],
        preview: {
          select: { value: 'value', label: 'label', prefix: 'prefix', suffix: 'suffix' },
          prepare({ value, label, prefix, suffix }: any) {
            return { title: `${prefix || ''}${value || '?'}${suffix || ''}`, subtitle: label || '' };
          },
        },
      }],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Stats', subtitle: 'Stats' };
    },
  },
};

const processSteps = {
  type: 'object',
  name: 'processSteps',
  title: 'Process Steps',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'Section Subheading', type: 'string' }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [{
        type: 'object',
        name: 'processStep',
        fields: [
          defineField({ name: 'title', title: 'Step Title', type: 'string' }),
          defineField({ name: 'description', title: 'Step Description', type: 'text' }),
          iconPickerField,
        ],
        preview: {
          select: { title: 'title', provider: 'icon.provider', name: 'icon.name' },
          prepare({ title, provider, name }: any) {
            return { title: title || 'Untitled Step', media: provider && name ? iconPreview({ provider, name }) : undefined };
          },
        },
      }],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Process Steps', subtitle: 'Process' };
    },
  },
};

const testimonialsSection = {
  type: 'object',
  name: 'testimonialsSection',
  title: 'Testimonials',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Client Testimonials',
      type: 'array',
      of: [{
        type: 'object',
        name: 'testimonialItem',
        fields: [
          defineField({ name: 'quote', title: 'Quote', type: 'text' }),
          defineField({ name: 'author', title: 'Author Name', type: 'string' }),
          defineField({ name: 'role', title: 'Role / Company', type: 'string' }),
          defineField({ name: 'rating', title: 'Star Rating', description: '1–5', type: 'number', validation: (Rule) => Rule.min(1).max(5) }),
          defineField({ name: 'photo', title: 'Photo', description: 'Optional headshot — falls back to author initial', type: 'image', options: { hotspot: true } }),
        ],
        preview: {
          select: { author: 'author', quote: 'quote', media: 'photo' },
          prepare({ author, quote, media }: any) {
            return { title: author || 'Anonymous', subtitle: quote ? `"${quote.slice(0, 60)}..."` : '', media };
          },
        },
      }],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Testimonials', subtitle: 'Testimonials' };
    },
  },
};

const pricingSection = {
  type: 'object',
  name: 'pricingSection',
  title: 'Pricing',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'Section Subheading', type: 'string' }),
    defineField({
      name: 'plans',
      title: 'Pricing Plans',
      type: 'array',
      of: [{
        type: 'object',
        name: 'pricingPlan',
        fields: [
          defineField({ name: 'name', title: 'Plan Name', type: 'string' }),
          defineField({ name: 'price', title: 'Price', type: 'string' }),
          defineField({ name: 'period', title: 'Period', description: 'e.g. "build investment"', type: 'string' }),
          defineField({ name: 'maintenancePrice', title: 'Maintenance Price', type: 'string' }),
          defineField({ name: 'maintenanceLabel', title: 'Maintenance Label', type: 'string' }),
          defineField({ name: 'description', title: 'Short Description', type: 'string' }),
          defineField({ name: 'features', title: 'Included Features', type: 'array', of: [{ type: 'string' }] }),
          defineField({ name: 'highlighted', title: 'Highlight This Plan', type: 'boolean' }),
          defineField({ name: 'ctaLabel', title: 'Button Text', type: 'string' }),
          defineField({ name: 'ctaUrl', title: 'Button Link', type: 'string' }),
        ],
        preview: {
          select: { name: 'name', price: 'price', highlighted: 'highlighted' },
          prepare({ name, price, highlighted }: any) {
            return { title: `${highlighted ? '⭐ ' : ''}${name || 'Untitled'}`, subtitle: price || '' };
          },
        },
      }],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Pricing', subtitle: 'Pricing' };
    },
  },
};

const pricingCtaSection = {
  type: 'object',
  name: 'pricingCtaSection',
  title: 'Pricing CTA',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body Content', description: 'Rich text', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'ctaLabel', title: 'Button Text', type: 'string' }),
    defineField({ name: 'ctaUrl', title: 'Button Link', type: 'string' }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Pricing CTA', subtitle: 'CTA' };
    },
  },
};

const faqSection = {
  type: 'object',
  name: 'faqSection',
  title: 'FAQ',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'Section Subheading', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Questions & Answers',
      type: 'array',
      of: [{
        type: 'object',
        name: 'faqItem',
        fields: [
          defineField({ name: 'question', title: 'Question', type: 'string' }),
          defineField({ name: 'answer', title: 'Answer', type: 'text' }),
        ],
        preview: {
          select: { question: 'question' },
          prepare({ question }: { question?: string }) {
            return { title: question || 'Untitled Question' };
          },
        },
      }],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'FAQ', subtitle: 'FAQ' };
    },
  },
};

const splitSection = {
  type: 'object',
  name: 'splitSection',
  title: 'Split Section',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow Text', description: 'Small uppercase text above the heading', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body Text', type: 'text' }),
    defineField({ name: 'ctaLabel', title: 'Button Text', type: 'string' }),
    defineField({ name: 'ctaUrl', title: 'Button Link', type: 'string' }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'imageAlt', title: 'Image alt text', description: 'Describe the image for screen readers', type: 'string' }),
    defineField({ name: 'imageRight', title: 'Image on Right Side', type: 'boolean' }),
    defineField({ name: 'bulletPoints', title: 'Bullet Points', type: 'array', of: [{ type: 'string' }] }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Split Section', subtitle: 'Split' };
    },
  },
};

const contactSection = {
  type: 'object',
  name: 'contactSection',
  title: 'Contact',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'Section Subheading', type: 'string' }),
    defineField({ name: 'preferenceNotes', title: 'Intro Text', type: 'text' }),
    defineField({ name: 'email', title: 'Email Address', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone Number', type: 'string' }),
    defineField({ name: 'showPhone', title: 'Show Phone Number', type: 'boolean' }),
    defineField({ name: 'responseTime', title: 'Response Time Note', type: 'string' }),
    defineField({ name: 'address', title: 'Physical Address', type: 'text' }),
    defineField({ name: 'hours', title: 'Business Hours', type: 'text' }),
  ],
  preview: {
    prepare() {
      return { title: 'Contact', subtitle: 'Contact' };
    },
  },
};

const textContent = {
  type: 'object',
  name: 'textContent',
  title: 'Text Content',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body Content', description: 'Rich text', type: 'array', of: [{ type: 'block' }] }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Text Content', subtitle: 'Text' };
    },
  },
};

const portfolioSection = {
  type: 'object',
  name: 'portfolioSection',
  title: 'Portfolio',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'Section Subheading', type: 'string' }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Portfolio', subtitle: 'Portfolio' };
    },
  },
};

const teamProjectsSection = {
  type: 'object',
  name: 'teamProjectsSection',
  title: 'Team Projects',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'Section Subheading', type: 'string' }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || 'Team Projects', subtitle: 'Team Projects' };
    },
  },
};

// ─── Page document type ──────────────────────────────────────────────────────

export default defineType({
  name: 'page',
  title: 'Pages',
  type: 'document',
  icon: HiDocumentText,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      description: 'The page URL path (e.g. /about, /services)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      description: 'Add sections and drag to reorder. Each section carries its own content.',
      type: 'array',
      of: [
        heroSection,
        featureGrid,
        statsSection,
        processSteps,
        testimonialsSection,
        pricingSection,
        pricingCtaSection,
        faqSection,
        splitSection,
        contactSection,
        textContent,
        portfolioSection,
        teamProjectsSection,
      ],
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare({ title, slug }) {
      return {
        title: title || 'Untitled',
        subtitle: slug || '/',
      };
    },
  },
});
