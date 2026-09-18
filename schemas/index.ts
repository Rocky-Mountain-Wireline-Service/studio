// Objects — reusable field shapes, never edited on their own
import seo from './objects/seo';
import link from './objects/link';
import figure from './objects/figure';

// Sections — the building blocks of a page
import { sectionTypes } from './sections';

// Documents — things the client edits in the Studio sidebar
import page from './documents/page';
import servicePage from './documents/servicePage';
import legalPage from './documents/legalPage';
import siteSettings from './documents/siteSettings';
import navigation from './documents/navigation';
import footerSettings from './documents/footerSettings';
import socialLinks from './documents/socialLinks';
import dynamicForm from './documents/dynamicForm';

export const schemaTypes = [
  // Objects
  seo,
  link,
  figure,

  // Sections
  ...sectionTypes,

  // Documents
  page,
  servicePage,
  legalPage,
  siteSettings,
  navigation,
  footerSettings,
  socialLinks,
  dynamicForm,
];
