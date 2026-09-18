# pws-studio-template

This is a **scaffold template** — not a live Sanity Studio. It is cloned and configured by [pws-scaffolder](https://github.com/EricPhifer/pws-scaffolder) to generate client-specific Sanity Studio projects.

## Stack

Sanity v3, TypeScript

## Placeholder Pattern

Client-specific values use the `##PLACEHOLDER##` pattern, replaced by the scaffolder at generation time:

- `##CLIENT_NAME##` — studio title
- `##CLIENT_SLUG##` — studio name (kebab-case)
- `##COLOR_ACCENT##`, `##COLOR_PRIMARY##`, `##COLOR_TEXT_INVERSE##` — VSCode chrome colors

## Base Schemas

These schemas ship with every Foundation build:

- **siteSettings** — singleton: site name, logo, navigation, contact info, social links, copyright
- **page** — generic page: title, slug, SEO fields (meta title, description, OG image), portable text content
- **navigationItem** — nav link object: title, internal reference or external URL, open in new tab
- **legalPage** — legal document: title, slug, last updated date, portable text body

The scaffolder adds project-specific schemas from the config's `sanity.schemaStubs` array on top of these base schemas and wires them into the schema index.

## Do Not

- Run this template directly — it requires a valid Sanity project ID
- Add client-specific schemas here — they go in `project-config.json` instead
- Remove base schemas — they are expected by the Foundation frontend