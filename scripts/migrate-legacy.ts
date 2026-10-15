/**
 * Reshape the legacy RMWS dataset into the current content model.
 *
 *   pnpm migrate         # dry run — prints what would change, writes nothing
 *   pnpm migrate:write   # actually write
 *   pnpm migrate:purge   # write, then delete the legacy documents
 *
 * Safe to run repeatedly: every document gets a deterministic _id and is written
 * with createOrReplace, so a second run reproduces the first rather than
 * duplicating it.
 *
 * Legacy documents are left untouched. Verify the result in the Studio first,
 * then remove them with `--purge-legacy` as a separate, deliberate step.
 */
import { getCliClient } from 'sanity/cli';
import { createReadStream, existsSync } from 'node:fs';
import { basename } from 'node:path';

// Flags arrive as environment variables, not argv: `sanity exec` consumes its
// own flags and does not forward the rest to the script.
const WRITE = process.env.MIGRATE_WRITE === '1';
const PURGE = process.env.MIGRATE_PURGE === '1';

const client = getCliClient();
const dataset = client.config().dataset;

// ─── Types ───────────────────────────────────────────────────────────────────

type Ref = { _ref: string; _type: 'reference' };
type LegacyImage = { asset?: Ref; crop?: unknown; hotspot?: unknown };
type Block = Record<string, unknown>;
type Doc = Record<string, any>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const missingAlt: string[] = [];

/**
 * Legacy stored an image and its alt text as two unrelated sibling fields.
 * Fold them back together. Images arriving without alt text are reported rather
 * than quietly marked decorative — a missing description is a content gap for
 * the client to fill, not something a migration should invent an answer for.
 */
function figure(image: LegacyImage | undefined, alt: string | undefined, where: string) {
  if (!image?.asset) return undefined;
  if (!alt) missingAlt.push(where);
  return {
    _type: 'figure',
    asset: image.asset,
    ...(image.crop ? { crop: image.crop } : {}),
    ...(image.hotspot ? { hotspot: image.hotspot } : {}),
    ...(alt ? { alt } : {}),
  };
}

/** Deterministic array keys, so re-running produces an identical document. */
const keyed = <T extends object>(prefix: string, items: T[]) =>
  items.map((item, i) => ({ _key: `${prefix}-${i}`, ...item }));

const section = (type: string, key: string, body: Doc) => ({ _type: type, _key: key, ...body });

/** Drop undefined values so createOrReplace does not write empty keys. */
function clean<T extends Doc>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && !v.length))
  ) as T;
}

const hasBlocks = (v: unknown): v is Block[] => Array.isArray(v) && v.length > 0;

/** Legal URLs gained hyphens in the rebuild; rewrite links that point at the old ones. */
const LEGAL_URL_MAP: Record<string, string> = {
  '/privacypolicy': '/privacy-policy',
  '/termsconditions': '/terms-and-conditions',
};
const remapUrl = (href: string) => LEGAL_URL_MAP[href] ?? href;

const links = (prefix: string, items: { pagename?: string; pagelink?: string }[] = []) =>
  keyed(
    prefix,
    items
      .filter((l) => l.pagename && l.pagelink)
      .map((l) => ({ _type: 'link', label: l.pagename!, href: remapUrl(l.pagelink!) }))
  );

/**
 * A card summary derived from the service's own body copy.
 *
 * The legacy schema had no summary field, so the services index rendered as
 * bare image-and-title cards with nothing to tell a visitor what the service
 * is. This also feeds the meta description when Search & Social is left blank,
 * so an empty summary costs a search snippet too.
 *
 * Cut on a sentence boundary where there is one in range, otherwise on a word
 * boundary — never mid-word.
 */
function summarize(blocks: Block[] | undefined, limit = 170): string | undefined {
  if (!Array.isArray(blocks)) return undefined;
  const text = blocks
    .filter((b: any) => b._type === 'block')
    .flatMap((b: any) => (b.children ?? []).map((c: any) => c.text ?? ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return undefined;
  if (text.length <= limit) return text;

  const window = text.slice(0, limit);
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
  if (sentenceEnd > limit * 0.5) return window.slice(0, sentenceEnd + 1).trim();
  return `${window.slice(0, window.lastIndexOf(' ')).trim()}…`;
}

// ─── Transforms ──────────────────────────────────────────────────────────────

function buildHome(src: Doc): Doc {
  const sections: Doc[] = [];

  sections.push(
    section('heroSection', 'hero', clean({
      heading: src.welcome,
      intro: hasBlocks(src.message) ? src.message : undefined,
      image: figure(src.image, src.headeralt, 'homepage hero'),
      // Both buttons were hardcoded in the Gatsby markup, so they never existed
      // as content the client could change. They do now.
      cta: { _type: 'link', label: 'Get a Quote', href: '/contact' },
      secondaryCta: { _type: 'link', label: 'Work With Us', href: '/employment' },
    }))
  );

  if (src.services?.length) {
    sections.push(
      section('linkCardGrid', 'cards', {
        layout: 'rows',
        cards: keyed(
          'card',
          src.services.map((s: Doc, i: number) =>
            clean({
              title: s.title,
              body: hasBlocks(s.servicecontent) ? s.servicecontent : undefined,
              image: figure(s.gridimage, s.gridalt, `homepage card ${i + 1} (${s.title})`),
              link: { _type: 'link', label: s.title, href: remapUrl(s.gridlink) },
            })
          )
        ),
      })
    );
  }

  if (src.locations?.length) {
    sections.push(
      section('locationsSection', 'locations', {
        heading: 'Our Locations',
        locations: keyed(
          'loc',
          src.locations.map((l: Doc) => clean({ city: l.city, state: l.state, phone: l.phone }))
        ),
      })
    );
  }

  return { _id: 'page-home', _type: 'page', title: 'Home', slug: { _type: 'slug', current: '/' }, sections };
}

function buildAbout(src: Doc): Doc {
  const sections: Doc[] = [
    section('heroSection', 'hero', clean({
      heading: src.title,
      image: figure(src.image, src.headeralt, 'about hero'),
    })),
  ];

  if (hasBlocks(src.content)) {
    sections.push(
      section('bodyContent', 'body', clean({
        body: src.content,
        image: figure(src.bodyimage, src.bodyalt, 'about body'),
      }))
    );
  }

  // mission[] and vision[] were two array types with identical field shapes.
  const cards = [
    ...(src.mission ?? []).map((m: Doc) =>
      clean({ title: m.missiontitle, statement: m.missionstatement, icon: figure(m.iconimage, m.iconalt, 'about mission icon') })
    ),
    ...(src.vision ?? []).map((v: Doc) =>
      clean({ title: v.visiontitle, statement: v.visionstatement, icon: figure(v.iconimage, v.iconalt, 'about vision icon') })
    ),
  ];
  if (cards.length) sections.push(section('statementCards', 'statements', { cards: keyed('stmt', cards) }));

  return { _id: 'page-about', _type: 'page', title: 'About Us', slug: { _type: 'slug', current: '/about' }, sections };
}

function buildServices(src: Doc, serviceIds: string[]): Doc {
  const sections: Doc[] = [
    section('heroSection', 'hero', clean({
      heading: src.title,
      image: figure(src.image, src.headeralt, 'services hero'),
    })),
  ];

  if (hasBlocks(src.content)) sections.push(section('bodyContent', 'body', { body: src.content }));

  sections.push(
    section('servicesGrid', 'grid', {
      services: serviceIds.map((id, i) => ({ _key: `svc-${i}`, _type: 'reference', _ref: id })),
    })
  );

  return { _id: 'page-services', _type: 'page', title: 'Services', slug: { _type: 'slug', current: '/services' }, sections };
}

/** Equipment, Safety and Employment share one shape: hero + body (+ optional extras). */
function buildSimplePage(src: Doc, id: string, title: string, slug: string, extras: Doc[] = []): Doc {
  const sections: Doc[] = [
    section('heroSection', 'hero', clean({
      heading: src.title ?? title,
      image: figure(src.image, src.headeralt, `${slug} hero`),
    })),
  ];

  if (hasBlocks(src.content)) {
    sections.push(
      section('bodyContent', 'body', clean({
        body: src.content,
        image: figure(src.bodyimage, src.bodyalt, `${slug} body`),
      }))
    );
  }

  return { _id: id, _type: 'page', title, slug: { _type: 'slug', current: slug }, sections: [...sections, ...extras] };
}

function buildContact(src: Doc): Doc {
  const sections: Doc[] = [
    section('heroSection', 'hero', clean({
      heading: src.headertitle ?? src.title,
      image: figure(src.image, src.headeralt, 'contact hero'),
    })),
  ];

  if (hasBlocks(src.content)) sections.push(section('bodyContent', 'body', { body: src.content }));

  if (src.contactinfo?.length) {
    sections.push(
      section('contactCards', 'cards', {
        cards: keyed(
          'card',
          src.contactinfo.map((c: Doc) =>
            clean({
              title: c.contacttitle,
              value: c.contactcontent,
              href: contactHref(c.contacttitle, c.contactcontent),
              icon: figure(c.contacticon, c.iconalt, `contact card ${c.contacttitle}`),
            })
          )
        ),
      })
    );
  }

  if (src.depthead?.length) {
    sections.push(
      section('staffDirectory', 'staff', {
        heading: 'Department Heads',
        // `contacttag` is deliberately dropped: it held a DOM id ("lanceschubert")
        // that the live page queried but never rendered. Anchors are derived from
        // the name in the frontend instead.
        people: keyed(
          'person',
          src.depthead.map((p: Doc) =>
            clean({
              name: p.contactname,
              jobTitle: p.contacttitle,
              region: p.region,
              email: p.contactemail,
              phone: p.contactphone,
              streetAddress: p.address,
              cityState: p.citystate,
            })
          )
        ),
      })
    );
  }

  sections.push(
    section('formSection', 'form', {
      heading: 'Send Us a Message',
      form: { _type: 'reference', _ref: 'form-contact' },
    })
  );

  return { _id: 'page-contact', _type: 'page', title: 'Contact Us', slug: { _type: 'slug', current: '/contact' }, sections };
}

/** Turn a contact card into something clickable where the label makes it obvious. */
function contactHref(title?: string, value?: string): string | undefined {
  if (!title || !value) return undefined;
  const label = title.toLowerCase();
  if (label.includes('phone')) return `tel:${value.replace(/[^\d+]/g, '')}`;
  if (label.includes('email')) return `mailto:${value.trim()}`;
  return undefined;
}

function buildServicePage(src: Doc): Doc {
  return clean({
    _id: `service-${src.slug.current}`,
    _type: 'servicePage',
    title: src.title,
    slug: src.slug,
    image: figure(src.image, src.headeralt, `service ${src.slug.current}`),
    summary: summarize(src.content),
    content: hasBlocks(src.content) ? src.content : undefined,
  });
}

function buildLegal(src: Doc, id: string, slug: string): Doc {
  return { _id: id, _type: 'legalPage', title: src.title, slug: { _type: 'slug', current: slug }, body: src.content };
}

// ─── Forms ───────────────────────────────────────────────────────────────────

const field = (
  name: string,
  label: string,
  type: string,
  required = false,
  options?: string[]
) => clean({ _type: 'formField', _key: name, name, label, type, required, options });

const contactForm = {
  _id: 'form-contact',
  _type: 'dynamicForm',
  title: 'Sales Inquiry',
  slug: { _type: 'slug', current: 'sales-inquiry' },
  active: true,
  notifyEmail: 'sales@rmws.com',
  successMessage: 'Thanks for reaching out. We will be in touch shortly.',
  spamProtection: { honeypot: true, minimumSeconds: 3 },
  fields: [
    field('fullname', 'Full Name', 'text', true),
    field('email', 'Email', 'email', true),
    field('phone', 'Phone', 'phone'),
    field('message', 'How can we help?', 'textarea', true),
  ],
};

const employmentForm = {
  _id: 'form-employment',
  _type: 'dynamicForm',
  title: 'Employment Application',
  slug: { _type: 'slug', current: 'employment-application' },
  active: true,
  notifyEmail: 'sales@rmws.com',
  successMessage: 'Thanks for applying. We will review your application and follow up.',
  spamProtection: { honeypot: true, minimumSeconds: 3 },
  fields: [
    field('branch', 'Which branch are you applying to?', 'select', true, [
      'Grand Junction, CO',
      'Johnstown, CO',
      'Casper, WY',
    ]),
    field('firstname', 'First Name', 'text', true),
    field('lastname', 'Last Name', 'text', true),
    field('email', 'Email', 'email', true),
    field('phone', 'Mobile Phone', 'phone', true),
    field('homephone', 'Home Phone', 'phone'),
    field('city', 'City', 'text'),
    field('state', 'State', 'text'),
    field('zip', 'ZIP Code', 'text'),
    field('position', 'Position Applied For', 'text', true),
    field('haveExperience', 'Do you have wireline experience?', 'radio', false, [
      'Have experience',
      "Don't have experience",
    ]),
    field('upload', 'Resume', 'file'),
    field('message', 'Anything else we should know?', 'textarea'),
  ],
};

// ─── Search copy ─────────────────────────────────────────────────────────────

/**
 * Starting search titles and descriptions, carried over from the migration
 * brief where they were researched against Google's truncation points.
 *
 * These seed the Search & Social tab so the client inherits usable copy instead
 * of empty fields; from here on the CMS is the source of truth and editing them
 * no longer needs a deploy. Descriptions run 109-152 characters.
 */
const PAGE_SEO: Record<string, { title: string; description: string }> = {
  'page-home': {
    title: 'Wireline Services',
    description:
      'Rocky Mountain Wireline Service has set the standard in wireline services since 1988. Find a location near you and request a quote.',
  },
  'page-about': {
    title: 'About Us',
    description:
      'Providing quality service since 1988 and rivaled by no other competitor. Read the mission and vision behind Rocky Mountain Wireline Service.',
  },
  'page-services': {
    title: 'Services',
    description:
      'Explore the wireline services RMWS provides, delivered by experienced crews through outstanding customer service and constant technological advancement.',
  },
  'page-equipment': {
    title: 'Equipment',
    description:
      'See the equipment behind Rocky Mountain Wireline Service, trusted by ISN, PEC, and SafeLand USA. Request a quote for your next job.',
  },
  'page-safety': {
    title: 'Safety',
    description:
      'Committed to safety both off and on the work site, RMWS delivers safe and efficient wireline services and products on every job.',
  },
  'page-employment': {
    title: 'Employment',
    description:
      'Work with the best. Apply to join the Rocky Mountain Wireline Service team and tell us which branch location and position you are after.',
  },
  'page-contact': {
    title: 'Contact Us',
    description:
      'Get in touch with Rocky Mountain Wireline Service. Request a quote, reach the branch nearest you, or send us a message and we will follow up.',
  },
  'legal-privacy-policy': {
    title: 'Privacy Policy',
    description:
      'How Rocky Mountain Wireline Service collects, uses, and protects the information you share with us through this site.',
  },
  'legal-terms-conditions': {
    title: 'Terms & Conditions',
    description:
      'The terms and conditions that govern your use of the Rocky Mountain Wireline Service website and its content.',
  },
};

const TAGLINE =
  'RMWS is committed to perpetuating our standard of excellence through outstanding customer service and constant technological advancement.';

/** Attach seed search copy to a document, leaving any the client has written alone. */
function withSeo(doc: Doc): Doc {
  const seed = PAGE_SEO[doc._id];
  if (!seed) return doc;
  return { ...doc, seo: { _type: 'seo', title: seed.title, description: seed.description } };
}

// ─── Accreditation logos ─────────────────────────────────────────────────────

/**
 * The Equipment page's "Trusted By" row was three PNGs imported directly into
 * the Gatsby bundle, so adding or dropping an accreditation meant a code change.
 * Upload them once into Sanity and let the client own them from here on.
 *
 * Paths are relative to the legacy repo, which sits alongside this one. If it is
 * not present the section is skipped rather than failing the migration — the
 * logos can be uploaded through the Studio instead.
 */
const LEGACY_IMAGES = '../../rmws-gatsby/src/images';

const TRUSTED_BY = [
  { name: 'ISN', file: 'rmws-trustied-by-isn.png' },
  { name: 'PEC', file: 'rmws-trustied-by-pec.png' },
  { name: 'SafeLand USA', file: 'rmws-trustied-by-safe-land-usa.png' },
];

async function uploadTrustedByLogos(write: boolean) {
  const available = TRUSTED_BY.filter((l) => existsSync(`${LEGACY_IMAGES}/${l.file}`));

  if (available.length !== TRUSTED_BY.length) {
    const absent = TRUSTED_BY.filter((l) => !available.includes(l)).map((l) => l.file);
    console.log(`  Skipping Trusted By — source files not found: ${absent.join(', ')}`);
    return undefined;
  }

  if (!write) {
    return section('logoStrip', 'trustedby', {
      heading: 'Trusted By',
      logos: keyed('logo', available.map((l) => ({ name: l.name, logo: '<uploads on --write>' }))),
    });
  }

  const logos = [];
  for (const { name, file } of available) {
    const path = `${LEGACY_IMAGES}/${file}`;
    // Sanity deduplicates by content hash, so re-running reuses the same asset
    // rather than piling up copies.
    const asset = await client.assets.upload('image', createReadStream(path), {
      filename: basename(path),
      title: name,
    });
    logos.push({ name, logo: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } });
  }

  return section('logoStrip', 'trustedby', { heading: 'Trusted By', logos: keyed('logo', logos) });
}

/**
 * Social profiles and the health-plan transparency link.
 *
 * All three were hardcoded in the Gatsby footer rather than stored as content,
 * so changing a profile URL meant a code change and a deploy. The MRF link is a
 * compliance requirement under the Transparency in Coverage Rule, which makes
 * it exactly the kind of thing that must not depend on a developer being
 * available.
 */
const SOCIAL_LINKS = {
  _id: 'socialLinks',
  _type: 'socialLinks',
  links: [
    {
      _key: 'facebook',
      _type: 'socialLink',
      platform: 'facebook',
      url: 'https://www.facebook.com/pages/Rocky-Mountain-Wireline-Service/104363879630844',
    },
    {
      _key: 'linkedin',
      _type: 'socialLink',
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/rocky-mountain-wireline-svc/',
    },
  ],
};

const MRF_LINK = {
  _type: 'link',
  label: 'MRFs for Transparency in Coverage Rule',
  href: 'https://www.cigna.com/legal/compliance/machine-readable-files',
  isExternal: true,
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (dataset === 'production' && WRITE) {
    console.error(
      '\nRefusing to write to the production dataset.\n' +
        'Migrate staging, verify it in the Studio, then promote with a dataset export/import.\n'
    );
    process.exit(1);
  }

  console.log(`\nDataset: ${dataset}`);
  console.log(WRITE ? 'Mode:    WRITE\n' : 'Mode:    dry run (run `pnpm migrate:write` to apply)\n');

  const legacy = await client.fetch<Record<string, any>>(`{
    "homepage":       *[_type == "homepage"][0],
    "about":          *[_type == "about"][0],
    "servicespage":   *[_type == "servicespage"][0],
    "equipment":      *[_type == "equipment"][0],
    "safety":         *[_type == "safety"][0],
    "employment":     *[_type == "employment"][0],
    "contactpage":    *[_type == "contactpage"][0],
    "navigation":     *[_type == "navigation"][0],
    "footer":         *[_type == "footer"][0],
    "privacyPolicy":  *[_type == "privacyPolicy"][0],
    "termsConditions":*[_type == "termsConditions"][0],
    "servicepages":   *[_type == "servicepages"] | order(title asc)
  }`);

  const missing = Object.entries(legacy)
    .filter(([, v]) => !v || (Array.isArray(v) && !v.length))
    .map(([k]) => k);
  if (missing.length) {
    console.error(`Missing legacy documents: ${missing.join(', ')}`);
    console.error('Refusing to run against an incomplete dataset.\n');
    process.exit(1);
  }

  const docs: Doc[] = [];

  // Services first — the services grid references them by id.
  const services = legacy.servicepages.map(buildServicePage);
  docs.push(...services);

  // Keep the order the live services index uses, not alphabetical.
  const orderedIds: string[] = (legacy.servicespage.services ?? [])
    .map((s: Doc) => `service-${String(s.gridlink).replace('/services/', '')}`)
    .filter((id: string) => services.some((svc: Doc) => svc._id === id));

  const trustedBy = await uploadTrustedByLogos(WRITE);

  const pages = [
    buildHome(legacy.homepage),
    buildAbout(legacy.about),
    buildServices(legacy.servicespage, orderedIds.length ? orderedIds : services.map((s: Doc) => s._id)),
    buildSimplePage(
      legacy.equipment,
      'page-equipment',
      'Equipment',
      '/equipment',
      trustedBy ? [trustedBy] : []
    ),
    buildSimplePage(legacy.safety, 'page-safety', 'Safety', '/safety'),
    buildSimplePage(legacy.employment, 'page-employment', 'Employment', '/employment', [
      section('formSection', 'form', {
        heading: 'Apply Now',
        form: { _type: 'reference', _ref: 'form-employment' },
      }),
    ]),
    buildContact(legacy.contactpage),
    buildLegal(legacy.privacyPolicy, 'legal-privacy-policy', '/privacy-policy'),
    buildLegal(legacy.termsConditions, 'legal-terms-conditions', '/terms-and-conditions'),
  ];

  docs.push(...pages.map(withSeo), contactForm, employmentForm);

  // Navigation — three link sets, each its own document.
  const nav = legacy.navigation;
  const footer = legacy.footer;
  docs.push(
    { _id: 'nav-main', _type: 'navigation', navType: 'main', items: links('main', nav.pagelinks) },
    { _id: 'nav-footer', _type: 'navigation', navType: 'footer', items: links('footer', footer.links) },
    {
      _id: 'nav-legal',
      _type: 'navigation',
      navType: 'legal',
      items: [...links('legal', footer.privterms), { _key: 'legal-mrf', ...MRF_LINK }],
    },
    SOCIAL_LINKS
  );

  docs.push(
    clean({
      _id: 'siteSettings',
      _type: 'siteSettings',
      siteName: footer.businessname,
      tagline: TAGLINE,
      defaultSeo: {
        _type: 'seo',
        description: PAGE_SEO['page-home']!.description,
      },
      logo: figure(nav.navlogo, nav.mainalt, 'site logo'),
      mobileLogo: figure(nav.mobilelogo, nav.mobilealt, 'mobile logo'),
      footerLogo: figure(footer.footerlogo, footer.logoalt, 'footer logo'),
      developerCredit: footer.dev,
      developerUrl: footer.devlink,
    })
  );

  docs.push(
    clean({
      _id: 'footerSettings',
      _type: 'footerSettings',
      mission: hasBlocks(footer.mission) ? footer.mission : undefined,
      linksHeading: footer.linktitle,
      contactHeading: footer.contacttitle,
      // Footer and contact-page details are migrated separately and on purpose:
      // they hold different phone numbers on the live site, so merging them would
      // silently change a published number. Reconcile in the Studio.
      contactCards: footer.contactinfo?.length
        ? {
            _type: 'contactCards',
            cards: keyed(
              'card',
              footer.contactinfo.map((c: Doc) =>
                clean({
                  title: c.contacttitle,
                  value: c.contactcontent,
                  href: contactHref(c.contacttitle, c.contactcontent),
                  icon: figure(c.contacticon, c.iconalt, `footer card ${c.contacttitle}`),
                })
              )
            ),
          }
        : undefined,
    })
  );

  // ── Report ──
  for (const doc of docs) {
    const detail = doc.sections
      ? `${doc.sections.length} section(s): ${doc.sections.map((s: Doc) => s._type).join(', ')}`
      : doc.items
        ? `${doc.items.length} link(s)`
        : doc.fields
          ? `${doc.fields.length} field(s)`
          : '';
    console.log(`  ${doc._type.padEnd(16)} ${String(doc._id).padEnd(26)} ${detail}`);
  }
  console.log(`\n  ${docs.length} documents`);

  if (missingAlt.length) {
    console.log(`\n  Images without alt text (${missingAlt.length}) — fill these in the Studio:`);
    for (const w of missingAlt) console.log(`    - ${w}`);
  }

  if (!WRITE) {
    console.log('\nDry run. Nothing written. Run `pnpm migrate:write` to apply.\n');
    return;
  }

  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc as any);
  await tx.commit();
  console.log(`\nWrote ${docs.length} documents to "${dataset}".`);

  if (PURGE) {
    const legacyTypes = [
      'homepage', 'about', 'servicespage', 'servicepages', 'equipment', 'safety',
      'employment', 'contactpage', 'navigation', 'footer', 'privacyPolicy', 'termsConditions',
    ];
    // The rewritten navigation documents reuse the `navigation` type, so delete
    // by the legacy ids only — a blanket type delete would remove what we just wrote.
    const stale = await client.fetch<string[]>(
      `*[_type in $types && !(_id in $keep) && !(_id in path("drafts.**"))]._id`,
      { types: legacyTypes, keep: docs.map((d) => d._id) }
    );
    if (stale.length) {
      const del = client.transaction();
      for (const id of stale) del.delete(id);
      await del.commit();
      console.log(`Deleted ${stale.length} legacy documents.`);
    } else {
      console.log('No legacy documents left to delete.');
    }
  } else {
    console.log('Legacy documents kept. Verify in the Studio, then run `pnpm migrate:purge`.\n');
  }
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
