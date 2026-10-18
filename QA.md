# Verification record — Open Draft prototype

Updated: October 17, 2026, for v0.2.0. This records observed checks, not accessibility certification or legal conformance.

## Version 0.2.0 translator verification

All 28 Node tests passed (21 original checks and 7 translator checks). Added coverage for exact contrast thresholds, safe color fallback, semantic formatting, literal wiki-command escaping, bounded document validation, migration of older projects, and contextual suggestions.

Browser verification additionally covered selection preservation for emphasis and links, undo/redo, unsafe URL rejection, plain-text paste, color warnings, UDL starters, copying through an instrumented clipboard interface, actual .wiki downloads, session recovery, project reopening, keyboard toolbar activation, and translator inclusion in contribution ZIPs with v0.2.0 metadata. Native system-clipboard permissions remain a deployment/browser-specific check.

No automated violations were reported on the populated translator. The full prior browser suite also passed after fixing footer link target spacing. Translator layout fit 320, 768, and 1440 CSS pixels without document-level horizontal overflow; desktop and mobile screenshots were inspected. Screen-reader and actual MediaWiki rendering tests remain outstanding. Browser-native editing uses deprecated execCommand; cross-browser behavior must be verified before production use.

The translator saves a separate scratchpad rather than modifying existing chapter content. Its rich source and colors survive reopening; its output is copied/downloaded or included separately in contribution ZIPs. It is not included in the book reading HTML.

## Before implementation

Two reviews are recorded in DESIGN-REVIEW.md: destination/user workflow fit, then accessibility/data/failure behavior. They established the wiki-first scope, local storage model, separate licenses, draft-only output, and explicit deferred conversion features.

## Pass 1 — model and export checks

21 Node tests passed. Coverage includes JSON round-trip, acknowledgment reset, unsupported versions, duplicate identifiers, missing source/media links, size/collection limits, URL schemes, HTML and wiki injection escaping, references, invalid/duplicate wiki titles, heading order, destination license checks, missing Commons media, raster signatures, media path safety, license tags, Unicode, attribution, and HTML headings. JavaScript syntax check passed.

## Pass 2 — real browser tasks and visual inspection

Microsoft Edge (Chromium), headless Playwright, on Windows. All scripted tasks passed:

- Keyboard skip-link navigation; content/page reorder controls and cancelable destructive dialog.
- Edit and refresh recovery; project download/reopen preserves pages, citations, media bytes, rights, and alternatives.
- Malformed JSON leaves the current project intact.
- Human review acknowledgments reset after editing.
- Wikibooks ZIP includes correct chapter mapping, references, image alternatives, metadata, and byte-identical original media.
- Commons ZIP excludes book publication files.
- Simulated storage quota failure retains the in-memory draft, reports the failure, and permits download.
- Explicit clearing removes the stored working copy.
- All five screens show no document-level horizontal overflow at 320, 768, and 1440 CSS pixels.
- Standalone reading HTML opens and produces a print proof.
- No JavaScript exceptions or external application requests during the tested flows.

axe-core 4.10.3: zero reported violations across setup, writing, sources/media, review, export, mobile setup, and exported reading HTML. The app scans included WCAG 2 A/AA, 2.1 AA, 2.2 AA, and best-practice rule tags. Some native-control color-contrast checks remained incomplete and need human evaluation. Automated results do not cover all WCAG criteria.

Inspected desktop and 320px screenshots and all three rendered pages of a sample print proof. No clipping, overlap, or horizontal spill observed. The test image is a single white pixel, deliberately visually blank. The PDF is a disposable layout proof, not a PDF/UA deliverable.

Corrections during verification: added a missing landmark around the introductory content, corrected preview/export heading nesting, rejected unsupported heading citations rather than losing them, kept generated media filenames safe, strengthened button boundary contrast, added image decoding checks, and aligned project-size/download handling.

### Environment limitation

The machine blocked normal loopback access between the preview server and test browser. Browser tests therefore served the actual checked-in static assets through Playwright request routing at an HTTP origin. This exercises the app and browser security policy but does not verify a live GitHub Pages deployment. Temporary servers were stopped. The user should perform the deployment smoke test in README.md after publishing.

## Checks still needed before a public production release

- Full keyboard task evaluation, screen-reader testing (for example NVDA/Firefox, NVDA/Chrome or Edge, and VoiceOver/Safari), speech input, high contrast, 200% text resize and 400% zoom, and usability testing with disabled contributors.
- Manual resolution of automated contrast checks marked incomplete, including native file/select controls on target platforms.
- Render the generated wiki source in a real Wikibooks sandbox; inspect references, navigation, image alternatives, and Commons templates. No wiki account was connected and no material was published during testing.
- Validate actual destination permissions and licensing, source accuracy, media metadata/privacy, and community scope. The application cannot determine those automatically.
- Cross-browser storage/download testing, including iOS Safari, private mode, restore sessions, blocked storage, and unusually large valid drafts.
- Map applicable standards and evidence before any WCAG/ADA/Section 508/international conformance claim. See PROJECT-REQUIREMENTS.md.

## Reproduce

Run `node --test tests/core.test.cjs tests/translator.test.cjs` with a current Node release. For browser checks, install Playwright in a development environment and download axe-core 4.10.3 to `tests/axe.min.js` from `https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js`. This test-only tool is not deployed. Run `node tests/browser.cjs`. Set `PLAYWRIGHT_MODULE` to an absolute package directory if it is not on the normal module path, and `BROWSER_EXE` to a local Chromium/Edge executable if not using Playwright's browser installation.

The harness writes screenshots, downloaded fixtures, a print proof, and browser-results.json to ignored `test-results/`. Do not upload those sample fixtures to a wiki. The release ZIP excludes them and the test-only axe download.


## Version 0.2.1 license cards · October 17, 2026

Two review passes: (1) semantic single-selection controls, persistent explanations, legal-summary and destination distinctions reviewed before editing; (2) implemented markup, input event persistence, responsive styles, and existing export compatibility reviewed before packaging.

Observed: 28 Node regression tests passed. Full Edge browser suite passed (including all five workflow screens at 320, 768, 1440 CSS pixels and translator checks). Focused license-cards.cjs passed: nine visible choices; arrow-key selection; simulated touch on full labels; one checked option; all options saved; new NC-SA choice restored after reload; card targets at least 44 × 44 CSS pixels; no horizontal overflow at 320, 390, 768, 1440 pixels; increased text spacing at 320 pixels; zero axe violations in that view. Forced-colors state was exercised, but assistive-technology announcement quality was not verified.

Mobile tests use Edge viewport/touch emulation, not physical iOS/Android devices. Real-device Safari/Chrome, VoiceOver/TalkBack, desktop screen readers, and comprehensive manual WCAG/ADA/508/EN 301 549 evaluation remain required. These checks are not a legal or accessibility certification. App content-license summaries link to official Creative Commons guidance; licenses remain subject to their full terms and exceptions.


## Version 0.3.0 reader · October 17, 2026

Pre-implementation review: separate public reading from local authoring; use anonymous CORS API requests; expose source revision, history, and license; reconstruct remote HTML from an allowlist. Second review: inspect sanitization, link handling, timeout/error preservation, version metadata, mobile layout, editor storage continuity, and privacy documentation.

28 Node tests passed. Full authoring/translator Edge suite passed after updating entry URLs to create.html; an existing asynchronous import assertion was changed to wait for its visible error. Reader tests passed using actual education-book API responses: exact revision URLs, site license metadata, chapter-link requests, source download, text/spacing preferences, preserved prior view on network failure, unsupported URL rejection, malicious markup removal, and editor session continuity. Zero axe violations at 320/390/768/1440 CSS pixels, with extra-large text and increased spacing; no page-wide horizontal overflow. Desktop and mobile screenshots inspected. A separate real browser CORS test loaded revision 3699368, timestamp 2020-06-13T01:08:19Z, from en.wikibooks.org successfully.

Reader regression command: node tests/reader.cjs with PLAYWRIGHT_MODULE and BROWSER_EXE configured as for the existing browser tests. It requires test-results/live-book.json and live-metadata.json: formatversion=2 responses for action=parse (education book, prop=text|revid) and action=query (the parsed revid, prop=revisions, rvprop=timestamp, meta=siteinfo, siprop=rightsinfo). These public downloaded fixtures are not included in the release ZIP. The live network check is recorded separately; fixture tests do not prove future service availability.

Limits: physical mobile and screen-reader testing remain outstanding. Source headings, tables, link labels, and factual/rights notices are inherited and cannot be guaranteed accessible or accurate. Source CSS/scripts are excluded; images become notes and unsupported interactive/media/math elements are omitted with a warning. No whole-book export, editor import, Commons reader, or automatic citation-style generator is claimed. Site license metadata does not override per-page exceptions. App license and book-content licenses remain separate.
