/**
 * Applies content the design pass introduced to an already-migrated dataset.
 *
 *   pnpm design:content         # dry run
 *   pnpm design:write           # apply
 *
 * `migrate-legacy.ts` also sets these, so a dataset migrated from scratch does
 * not need this script. It exists because staging had already been migrated and
 * its legacy source purged, and re-deriving the whole dataset to change two
 * fields would be a far heavier operation than patching them.
 *
 * Every write is a targeted `set` on a known path: nothing is deleted, and
 * re-running produces the same result.
 */
import { getCliClient } from 'sanity/cli';

const WRITE = process.env.DESIGN_WRITE === '1';
const client = getCliClient();
const dataset = client.config().dataset;

interface Patch {
  id: string;
  label: string;
  set: Record<string, unknown>;
}

const CONTACT_SALES = { _type: 'link', label: 'Contact Sales', href: '/contact#contact-form' };

/** One paragraph of Portable Text, keyed so re-running writes the same value. */
const heroIntro = (text: string) => [
  {
    _type: 'block',
    _key: 'tagline',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 'tagline-text', text, marks: [] }],
  },
];

const PATCHES: Patch[] = [
  {
    id: 'page-home',
    label: 'Homepage hero buttons',
    // Both buttons were hardcoded in the Gatsby markup and never existed as
    // content. The client owns them now.
    set: {
      'sections[_key=="hero"].cta': { _type: 'link', label: 'Get a Quote', href: '/contact' },
      'sections[_key=="hero"].secondaryCta': {
        _type: 'link',
        label: 'Work With Us',
        href: '/employment',
      },
    },
  },
  {
    id: 'page-employment',
    label: 'Application form appearance',
    // A thirteen-field application is a task to work through rather than a
    // moment to convert, so it takes the light card. The short sales inquiry
    // keeps the brand red.
    set: { 'sections[_key=="form"].tone': 'light' },
  },
  {
    id: 'siteSettings',
    label: 'Header button',
    // "Request a Quote" overstated what the button does — it opens a contact
    // form, not a quoting tool. The anchor lands on the form itself.
    set: {
      headerCta: {
        _type: 'link',
        label: 'Contact Sales',
        href: '/contact#contact-form',
      },
    },
  },
  {
    id: 'siteSettings',
    label: 'Footer credit',
    // The field holds the whole phrase, not just the name, so the lead-in is
    // content the migration needed to carry.
    set: { developerCredit: 'Crafted by Phifer Web Solutions' },
  },
  {
    id: 'page-home',
    label: 'Homepage content layout',
    // These entries carry several paragraphs each; alternating rows is the live
    // site's layout for them and the only one that gives the copy a readable
    // measure.
    set: { 'sections[_key=="cards"].layout': 'rows' },
  },
  // The interior heroes' taglines and buttons were hardcoded in the Gatsby
  // markup, so the migration had nothing to carry across and these pages opened
  // on a bare title. The wording is the live site's; the button follows the
  // header's "Contact Sales" and lands on the form itself.
  ...Object.entries({
    'page-about': 'Providing quality service since 1988. Rivaled by no other competitor.',
    'page-equipment': 'Over 30 specialized equipment for fast, efficient and reliable service.',
    'page-safety':
      'Committed to safety both off and on the work site providing safe and efficient wire line services and products.',
  }).map(([id, tagline]) => ({
    id,
    label: 'Hero tagline and button',
    set: {
      'sections[_key=="hero"].intro': heroIntro(tagline),
      'sections[_key=="hero"].cta': CONTACT_SALES,
      ...(id === 'page-safety'
        ? {
            'sections[_key=="hero"].secondaryCta': {
              _type: 'link',
              label: 'Work With Us',
              href: '/employment',
            },
          }
        : {}),
    },
  })),
  {
    id: 'page-employment',
    label: 'Hero tagline',
    set: { 'sections[_key=="hero"].intro': heroIntro('Work with the best.') },
  },
];

/**
 * Sections whose order should match the live site. Ordering is content, not
 * layout — the client can drag these in the Studio — so this only sets the
 * starting arrangement.
 */
const SECTION_ORDER: Record<string, string[]> = {
  // Locations sit directly under the hero on the live site: a visitor looking
  // for their nearest branch should not have to scroll the whole page first.
  'page-home': ['hero', 'locations', 'cards'],
  // The form is why most people open this page, so it leads. The one-line
  // intro that used to sit above it moves into the form's own intro field
  // rather than being repeated as a separate block.
  'page-contact': ['hero', 'form', 'cards', 'staff', 'map'],
};

/**
 * Fills in service card summaries, which the original migration did not produce.
 * Only writes where the field is still empty, so anything the client has since
 * written by hand survives.
 */
async function backfillServiceSummaries(write: boolean) {
  const services = await client.fetch<{ _id: string; title: string; summary?: string; content?: any[] }[]>(
    `*[_type == "servicePage"]{ _id, title, summary, content }`
  );

  for (const svc of services) {
    if (svc.summary) {
      console.log(`  ${svc._id} summary already set — left alone`);
      continue;
    }
    const text = (svc.content ?? [])
      .filter((b: any) => b._type === 'block')
      .flatMap((b: any) => (b.children ?? []).map((c: any) => c.text ?? ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) { console.log(`  ${svc._id} has no body copy to summarize`); continue; }

    let summary = text;
    if (text.length > 170) {
      const window = text.slice(0, 170);
      const end = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
      summary = end > 85 ? window.slice(0, end + 1).trim() : `${window.slice(0, window.lastIndexOf(' ')).trim()}…`;
    }

    console.log(`  ${svc._id} summary = "${summary.slice(0, 70)}..."`);
    if (write) await client.patch(svc._id).set({ summary }).commit();
  }
}

/**
 * Social profiles and the transparency-in-coverage link, neither of which the
 * legacy dataset held — both were hardcoded in the Gatsby footer.
 */
/**
 * Moves the contact page's standalone intro line into the form it introduces,
 * then drops the now-duplicated block. Skipped once the form already has an
 * intro, so it cannot clobber copy written in the Studio.
 */
/**
 * Adds the office map to the foot of the contact page.
 *
 * Reuses the exact embed the previous site used, taken from Google Maps'
 * Share -> Embed a map panel. That form pins the business's own listing rather
 * than running a text search for the address, so the map shows the RMWS place
 * marker with its name. It also needs no API key, billing account or anything
 * to rotate.
 */
async function addContactMap(write: boolean) {
  const ADDRESS = '2144 Hwy 6 & 50\nGrand Junction, CO 81505';
  const map = {
    _key: 'map',
    _type: 'mapEmbed',
    heading: 'Find Us',
    embedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3095.52232083304!2d-108.65932904879496!3d39.117344141453245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8746fd7c724cf171%3A0x618cc3fb2759c091!2sRocky%20Mountain%20Wireline%20Service!5e0!3m2!1sen!2sus!4v1666026542279!5m2!1sen!2sus',
    label: 'Map showing the Rocky Mountain Wireline Service office in Grand Junction, Colorado',
    address: ADDRESS,
    height: 'medium',
  };

  const page = await client.fetch<{ sections?: any[] }>(`*[_id == "page-contact"][0]{ sections }`);
  if (!page?.sections) { console.log('  page-contact not found'); return; }
  const existing = page.sections.find((s) => s._key === 'map');
  if (existing) {
    if (existing.embedUrl === map.embedUrl) {
      console.log('  page-contact map already correct');
      return;
    }
    console.log('  page-contact map embed updated to the business listing');
    if (write) {
      await client
        .patch('page-contact')
        .set({ sections: page.sections.map((s) => (s._key === 'map' ? { ...s, ...map } : s)) })
        .commit();
    }
    return;
  }

  console.log('  page-contact += map at the foot of the page');
  if (write) await client.patch('page-contact').set({ sections: [...page.sections, map] }).commit();
}

/**
 * Moves a page's standalone intro line into the form it introduces, then drops
 * the now-duplicated block.
 *
 * On both of these pages the line is instructions for the form — "Feel free to
 * contact us", "If you have a resume please upload it here" — but sat in its
 * own section above it, separated by a section boundary and a change of
 * background. One sentence alone on a full-width band reads as an empty page
 * rather than as a caption for what follows.
 *
 * Skipped once the form already has an intro, so it cannot clobber copy
 * written in the Studio.
 */
async function foldFormIntros(write: boolean) {
  for (const id of ['page-contact', 'page-employment']) {
    const page = await client.fetch<{ sections?: any[] }>(`*[_id == $id][0]{ sections }`, { id });
    if (!page?.sections) continue;

    const body = page.sections.find((s) => s._key === 'body' && s._type === 'bodyContent');
    const form = page.sections.find((s) => s._key === 'form' && s._type === 'formSection');

    if (!body || !form) { console.log(`  ${id}: nothing to fold`); continue; }
    if (form.intro?.length) { console.log(`  ${id}: form already has an intro — left alone`); continue; }
    if (!body.body?.length) { console.log(`  ${id}: intro block is empty`); continue; }

    const sections = page.sections
      .filter((s) => s._key !== 'body')
      .map((s) => (s._key === 'form' ? { ...s, intro: body.body } : s));

    console.log(`  ${id}: intro folded into the form, standalone block removed`);
    if (write) await client.patch(id).set({ sections }).commit();
  }
}

/**
 * Lets short fields share a row. Thirteen full-width boxes in one column is a
 * long scroll and reads as a wall; City, State and ZIP in particular waste a
 * full row each. Only applied where a field has no width set, so a choice made
 * in the Studio is never overwritten.
 */
/**
 * Field order and width together, because the two cannot be chosen separately:
 * the grid fills row by row, so a half-width field followed by a third-width
 * one leaves a gap and pushes everything after it out of alignment. Each row
 * below adds up to a whole: 3+3, or 2+2+2, or one full-width field.
 */
const FIELD_LAYOUT: Record<string, { name: string; width: 'full' | 'half' | 'third' }[]> = {
  'form-employment': [
    { name: 'branch', width: 'full' },
    { name: 'firstname', width: 'half' },
    { name: 'lastname', width: 'half' },
    { name: 'email', width: 'half' },
    { name: 'phone', width: 'half' },
    { name: 'homephone', width: 'half' },
    { name: 'position', width: 'half' },
    { name: 'city', width: 'third' },
    { name: 'state', width: 'third' },
    { name: 'zip', width: 'third' },
    { name: 'haveExperience', width: 'full' },
    { name: 'upload', width: 'full' },
    { name: 'message', width: 'full' },
  ],
};

async function setFieldWidths(write: boolean) {
  for (const [id, layout] of Object.entries(FIELD_LAYOUT)) {
    const form = await client.fetch<{ fields?: any[] }>(`*[_id == $id][0]{ fields }`, { id });
    if (!form?.fields?.length) { console.log(`  ${id}: no fields`); continue; }

    const byName = new Map(form.fields.map((f) => [f.name, f]));
    const ordered = [
      ...layout.filter((l) => byName.has(l.name)).map((l) => ({ ...byName.get(l.name)!, width: l.width })),
      // A field added in the Studio keeps its place at the end rather than
      // being dropped by a layout that predates it.
      ...form.fields.filter((f) => !layout.some((l) => l.name === f.name)),
    ];

    const before = form.fields.map((f) => `${f.name}:${f.width ?? '-'}`).join(',');
    const after = ordered.map((f) => `${f.name}:${f.width ?? '-'}`).join(',');
    if (before === after) { console.log(`  ${id}: layout already correct`); continue; }

    console.log(`  ${id}: ${ordered.filter((f) => f.width !== 'full').length} fields share rows`);
    if (write) await client.patch(id).set({ fields: ordered }).commit();
  }
}

async function addFooterLinks(write: boolean) {
  const social = {
    _id: 'socialLinks',
    _type: 'socialLinks',
    links: [
      { _key: 'facebook', _type: 'socialLink', platform: 'facebook', url: 'https://www.facebook.com/pages/Rocky-Mountain-Wireline-Service/104363879630844' },
      { _key: 'linkedin', _type: 'socialLink', platform: 'linkedin', url: 'https://www.linkedin.com/company/rocky-mountain-wireline-svc/' },
    ],
  };

  const existing = await client.fetch(`*[_id == "socialLinks"][0]{ _id, links }`);
  if (existing?.links?.length) {
    console.log('  socialLinks already populated — left alone');
  } else {
    console.log(`  socialLinks = ${social.links.map((l) => l.platform).join(', ')}`);
    if (write) await client.createOrReplace(social);
  }

  const mrf = {
    _key: 'legal-mrf',
    _type: 'link',
    label: 'MRFs for Transparency in Coverage Rule',
    href: 'https://www.cigna.com/legal/compliance/machine-readable-files',
    isExternal: true,
  };
  const nav = await client.fetch<{ items?: { _key: string }[] }>(`*[_id == "nav-legal"][0]{ items }`);
  if (nav?.items?.some((i) => i._key === 'legal-mrf')) {
    console.log('  nav-legal already has the MRF link');
  } else {
    console.log('  nav-legal += MRFs for Transparency in Coverage Rule');
    if (write) await client.patch('nav-legal').set({ items: [...(nav?.items ?? []), mrf] }).commit();
  }
}

async function reorderSections(write: boolean) {
  for (const [id, order] of Object.entries(SECTION_ORDER)) {
    const doc = await client.fetch<{ sections?: { _key: string }[] }>(
      `*[_id == $id][0]{ sections }`,
      { id }
    );
    if (!doc?.sections?.length) continue;

    const byKey = new Map(doc.sections.map((s) => [s._key, s]));
    const ordered = [
      ...order.map((k) => byKey.get(k)).filter(Boolean),
      // Anything not named keeps its position at the end, so a section added in
      // the Studio is never silently dropped.
      ...doc.sections.filter((s) => !order.includes(s._key)),
    ];

    const current = doc.sections.map((s) => s._key).join(',');
    const next = ordered.map((s) => s!._key).join(',');
    if (current === next) {
      console.log(`  ${id}  section order already ${next}`);
      continue;
    }
    console.log(`  ${id}  section order ${current} -> ${next}`);
    if (write) await client.patch(id).set({ sections: ordered }).commit();
  }
}

async function main() {
  if (dataset === 'production' && WRITE) {
    console.error('\nRefusing to write to production. Promote via a reviewed dataset copy.\n');
    process.exit(1);
  }

  console.log(`\nDataset: ${dataset}`);
  console.log(WRITE ? 'Mode:    WRITE\n' : 'Mode:    dry run (run `pnpm design:write` to apply)\n');

  for (const patch of PATCHES) {
    const doc = await client.fetch(`*[_id == $id][0]{ _id }`, { id: patch.id });
    if (!doc) {
      console.error(`  ${patch.id} not found — has the dataset been migrated?`);
      process.exit(1);
    }
    for (const [path, value] of Object.entries(patch.set)) {
      console.log(`  ${patch.id}  ${path} = ${JSON.stringify(value)}`);
    }
    if (WRITE) {
      await client.patch(patch.id).set(patch.set).commit();
    }
  }

  await reorderSections(WRITE);
  await backfillServiceSummaries(WRITE);
  await addFooterLinks(WRITE);
  await setFieldWidths(WRITE);
  await foldFormIntros(WRITE);
  await addContactMap(WRITE);

  console.log(WRITE ? `\nApplied changes to "${dataset}".\n` : '\nDry run. Nothing written.\n');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
