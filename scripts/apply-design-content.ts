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
    id: 'page-home',
    label: 'Homepage content layout',
    // These entries carry several paragraphs each; alternating rows is the live
    // site's layout for them and the only one that gives the copy a readable
    // measure.
    set: { 'sections[_key=="cards"].layout': 'rows' },
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
  'page-contact': ['hero', 'form', 'cards', 'staff', 'body'],
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
    if (!text) { console.log(`  ${svc._id} has no body copy to summarise`); continue; }

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
async function foldContactIntro(write: boolean) {
  const page = await client.fetch<{ sections?: any[] }>(
    `*[_id == "page-contact"][0]{ sections }`
  );
  if (!page?.sections) return;

  const body = page.sections.find((s) => s._key === 'body' && s._type === 'bodyContent');
  const form = page.sections.find((s) => s._key === 'form' && s._type === 'formSection');

  if (!body || !form) { console.log('  page-contact: nothing to fold'); return; }
  if (form.intro?.length) { console.log('  page-contact: form already has an intro — left alone'); return; }
  if (!body.body?.length) { console.log('  page-contact: intro block is empty'); return; }

  const sections = page.sections
    .filter((s) => s._key !== 'body')
    .map((s) => (s._key === 'form' ? { ...s, intro: body.body } : s));

  console.log('  page-contact: intro folded into the form, standalone block removed');
  if (write) await client.patch('page-contact').set({ sections }).commit();
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
  await foldContactIntro(WRITE);

  console.log(WRITE ? `\nApplied changes to "${dataset}".\n` : '\nDry run. Nothing written.\n');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
