# Wiki-first draft: two reviews before implementation

Date: 2026-10-16. Working product name: Open Draft. This is an independent tool, not a Wikimedia product.

## Review 1 — user needs and destination fit

The primary journey is create or reopen a local project → organize Wikibooks pages → write structured content → record sources and media rights → review → download a contribution package. Commons has its own media-focused export mode. Local/private work is supported without an open license. Accessibility applies to all modes.

Decisions: use genuine MediaWiki wikitext, not decorative HTML pasted into a wiki. Supply a book landing page, chapter files, references, image alternatives, captions, and per-file Commons descriptions. Include precise page-to-file mapping and manual publication instructions. A ZIP is a handoff package, not something Wikibooks or Commons can universally import. Do not connect an account or publish in this draft.

Scope: a working static authoring app, project JSON import/export with embedded images, session working copy, structured blocks, reorder controls, source records, media rights records, checks, reader preview, wikitext, contribution ZIP, and HTML export. IMSCC import, EPUB, verified tagged PDF, advanced tables/equations, direct API publication, and other wiki adapters remain explicit subsequent milestones. Unsupported imports must produce useful messages, never pretend to succeed.

## Review 2 — accessibility, data, and failure behavior

Use native form controls, explicit labels and instructions, logical headings, a skip link, visible focus, live status, text error lists, keyboard reorder controls, and responsive layouts. Preview uses DOM text or escaped markup, never imported executable HTML. Warn that automated checks cannot verify alternative-text quality, sourcing, permissions, or complete conformance.

Use sessionStorage for a tab's temporary working copy, with a memory-only option. Browser restore behavior can retain a session; closing a tab is not a secure-erasure guarantee. Provide explicit clearing and downloaded project backups. A failed/quota-limited save must retain the in-memory project and visibly request a backup. Cap draft files and embedded media to manageable sizes. No analytics, remote fonts, AI services, uploads, or network processing. Ordinary hosting requests still reach the hosting provider; external guidance links leave the app only when selected.

Validate imported JSON before replacement; cap array/string sizes, accept only known types, reject duplicate IDs and broken references, allow only raster image data with matching signatures. Reject unsafe URLs and path-like titles. Use locally bundled ZIP code, relative asset paths, and no build step. Require confirmation before replacing a current project or deleting content. Preserve ordering, citations, alternatives, rights, and originals across download/reopen.

Rights checks flag unresolved or destination-incompatible licensing. A project license never replaces media licenses. Human acknowledgments reset when project content changes. Downloads remain labeled drafts; no unsupported compliance or OER-ready badge. Contribution checklists do not constitute community acceptance.

## Verification planned after implementation

First pass: independent model/export tests for malformed imports, injection payloads, title collisions, hierarchy, licenses, references, Unicode, media bytes, and ZIP integrity. Second pass: browser task tests including create/edit/reorder/import/export, reload recovery, storage failure, keyboard focus, small viewport, automated accessibility analysis if available, and visual/print inspection. Record observed results and remaining manual assistive-technology verification in QA.md.
