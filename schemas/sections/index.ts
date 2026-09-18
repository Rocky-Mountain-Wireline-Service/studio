import heroSection from './heroSection';
import bodyContent from './bodyContent';
import linkCardGrid from './linkCardGrid';
import servicesGrid from './servicesGrid';
import locationsSection from './locationsSection';
import statementCards from './statementCards';
import logoStrip from './logoStrip';
import contactCards from './contactCards';
import staffDirectory from './staffDirectory';
import formSection from './formSection';

/** Every section type, in the order they appear in the "Add section" menu. */
export const sectionTypes = [
  heroSection,
  bodyContent,
  linkCardGrid,
  servicesGrid,
  locationsSection,
  statementCards,
  logoStrip,
  contactCards,
  staffDirectory,
  formSection,
];

/** Names only — `page.sections` uses these to build its `of` array. */
export const sectionMembers = sectionTypes.map((t) => ({ type: t.name }));
