import type { StructureResolver } from 'sanity/structure';
import { HiDocumentText, HiScale } from 'react-icons/hi2';
import { RiPagesLine } from 'react-icons/ri';
import { IoSettingsSharp } from 'react-icons/io5';
import { MdMenu, MdOutlineWebAsset, MdOutlineDynamicForm } from 'react-icons/md';
import { FaGlobe } from 'react-icons/fa6';

/**
 * Documents that exist exactly once. Sanity's default structure renders these
 * as a list containing a single row, which invites the client to click twice to
 * reach content that has only one possible destination — and leaves a "create"
 * affordance for something that must never have a second copy.
 */
const SINGLETONS = [
  { id: 'siteSettings', type: 'siteSettings', title: 'Site Settings', icon: IoSettingsSharp },
  { id: 'footerSettings', type: 'footerSettings', title: 'Footer', icon: MdOutlineWebAsset },
  { id: 'socialLinks', type: 'socialLinks', title: 'Social Links', icon: FaGlobe },
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('page').title('Pages').icon(HiDocumentText),
      S.documentTypeListItem('servicePage').title('Services').icon(RiPagesLine),
      S.documentTypeListItem('legalPage').title('Legal Pages').icon(HiScale),

      S.divider(),

      S.documentTypeListItem('navigation').title('Navigation').icon(MdMenu),
      S.documentTypeListItem('dynamicForm').title('Forms').icon(MdOutlineDynamicForm),

      S.divider(),

      ...SINGLETONS.map(({ id, type, title, icon }) =>
        S.listItem()
          .title(title)
          .icon(icon)
          .child(S.document().schemaType(type).documentId(id).title(title))
      ),
    ]);

/** Singleton ids, so document actions can forbid creating or deleting them. */
export const singletonIds = SINGLETONS.map((s) => s.id);
export const singletonTypes = SINGLETONS.map((s) => s.type);
