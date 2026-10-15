import type { StructureResolver } from 'sanity/structure';
import { HiDocumentText, HiScale } from 'react-icons/hi2';
import { RiPagesLine } from 'react-icons/ri';
import { IoSettingsSharp } from 'react-icons/io5';
import { MdMenu, MdOutlineWebAsset, MdOutlineDynamicForm, MdOutlineHome } from 'react-icons/md';
import { FaGlobe } from 'react-icons/fa6';

/**
 * The Studio sidebar, arranged the way the client thinks about the site
 * rather than by document type:
 *
 *   Website pages   — the pages, in the order they appear in the menu
 *   Services        — one entry per service
 *   Legal pages
 *   ─────
 *   Forms
 *   ─────
 *   Menus · Footer · Social links · Site settings
 *
 * Pages, menus and the settings documents exist exactly once each and cannot
 * be created or deleted, so they are listed by name rather than as lists the
 * client has to search through.
 */

/** Documents that exist exactly once. */
const SINGLETONS = [
  { id: 'footerSettings', type: 'footerSettings', title: 'Footer', icon: MdOutlineWebAsset },
  { id: 'socialLinks', type: 'socialLinks', title: 'Social links', icon: FaGlobe },
  { id: 'siteSettings', type: 'siteSettings', title: 'Site settings', icon: IoSettingsSharp },
] as const;

/** The site's pages, in menu order. Each is a fixed document the site is built around. */
const PAGES = [
  { id: 'page-home', title: 'Home', icon: MdOutlineHome },
  { id: 'page-about', title: 'About Us' },
  { id: 'page-services', title: 'Services (overview page)' },
  { id: 'page-equipment', title: 'Equipment' },
  { id: 'page-safety', title: 'Safety' },
  { id: 'page-employment', title: 'Employment' },
  { id: 'page-contact', title: 'Contact Us' },
];

const MENUS = [
  { id: 'nav-main', title: 'Main menu (top of every page)' },
  { id: 'nav-footer', title: 'Footer links' },
  { id: 'nav-legal', title: 'Legal links (bottom bar)' },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Website')
    .items([
      S.listItem()
        .title('Website pages')
        .icon(HiDocumentText)
        .child(
          S.list()
            .title('Website pages')
            .items(
              PAGES.map(({ id, title, icon }) =>
                S.listItem()
                  .id(id)
                  .title(title)
                  .icon(icon ?? HiDocumentText)
                  .child(S.document().schemaType('page').documentId(id).title(title))
              )
            )
        ),
      S.listItem()
        .title('Services')
        .icon(RiPagesLine)
        .child(
          S.documentTypeList('servicePage')
            .title('Services')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),
      S.listItem()
        .title('Legal pages')
        .icon(HiScale)
        .child(S.documentTypeList('legalPage').title('Legal pages').defaultOrdering([{ field: 'title', direction: 'asc' }])),

      S.divider(),

      S.listItem()
        .title('Forms')
        .icon(MdOutlineDynamicForm)
        .child(S.documentTypeList('dynamicForm').title('Forms').defaultOrdering([{ field: 'title', direction: 'asc' }])),

      S.divider(),

      S.listItem()
        .title('Menus')
        .icon(MdMenu)
        .child(
          S.list()
            .title('Menus')
            .items(
              MENUS.map(({ id, title }) =>
                S.listItem()
                  .id(id)
                  .title(title)
                  .icon(MdMenu)
                  .child(S.document().schemaType('navigation').documentId(id).title(title))
              )
            )
        ),
      ...SINGLETONS.map(({ id, type, title, icon }) =>
        S.listItem()
          .id(id)
          .title(title)
          .icon(icon)
          .child(S.document().schemaType(type).documentId(id).title(title))
      ),
    ]);

/** Singleton ids, so document actions can forbid creating or deleting them. */
export const singletonIds = SINGLETONS.map((s) => s.id);
export const singletonTypes = SINGLETONS.map((s) => s.type);
