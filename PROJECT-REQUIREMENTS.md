# Accessible publishing platform — standing requirements

Recorded 16 October 2026. New project, separate from the geology textbook. Working name only.

## User mandate

Accessibility is mandatory from initial design through implementation, imports, authoring, previews, exports, documentation, and publishing workflows. WCAG 2.1 AA is the minimum. Address ADA Title II, Revised Section 508, the user's Section 502 requirement, and relevant international standards. Do not weaken this requirement to accommodate visual design, convenience, or automation.

Interpretation pending clarification: Section 502 is understood as Revised Section 508 Standards, Chapter 5, 502 — Interoperability with Assistive Technology. This is not treated as an independent statute or as automatically applicable to every web component. If the user means a different provision, update the mapping.

## Product scope

Priority clarified 16 October 2026: wiki contribution quality is the primary product focus. Deliver a static, user-hosted draft with local file selection, a temporary browser working copy, and explicit downloads. The user handles GitHub publication. Other document/conversion features remain secondary milestones. See DESIGN-REVIEW.md and README.md for the implemented prototype boundary; the broader requirements below remain the target, not a claim that every exporter exists.

- Create projects from scratch in an accessible structured editor.
- Import Common Cartridge (.imscc), initially prioritize Canvas exports; identify cartridge versions and unsupported content explicitly.
- Choose both output format and destination: reflowable EPUB, structured/tagged PDF, accessible HTML, and Wikimedia contribution packages; consider editable document formats as additional exporters.
- Offer local downloads without publishing. Public publishing is a separate explicit action.
- Automate reliable transformations; show semantic or AI-generated changes for review. Preserve source content, provenance, and an itemized conversion record. Account for every imported resource.
- Keep student and instructor outputs separate; exclude answer keys and instructor-only material from student exports by default.
- Support guided Wikimedia exports first and authorized publishing automation later. Preserve applicable permissions, attribution, licensing, and destination-specific review.

## Open education, copyright, authoring, and attribution

Open education is a core supported workflow; choosing an open license is optional. All projects retain the same mandatory accessibility requirements. Keep audience/visibility, output format, destination, and licensing as independent choices. Downloading a project does not publish it or grant an open license.

- Provide short, contextual explanations of copyright, public domain, permissions, open licensing, attribution, adaptation, and redistribution. Explain how OER can support affordability, localization, accessible adaptations, collaboration, and continued improvement. Free access alone does not establish that a resource is OER; use UNESCO's definition, including permission to adapt and redistribute.
- Offer a guided license chooser with plain-language consequences and links to the actual terms. Support reserved rights, Creative Commons licenses, CC0/public-domain status where appropriate, custom permissions, mixed rights, and unresolved rights. Do not assign an open license automatically. Explain that CC licenses are generally irrevocable for recipients who comply with their terms and that authors can license only rights they control.
- Distinguish licenses permitting adaptation from NoDerivatives licenses when describing OER. Explain NonCommercial and ShareAlike conditions and assess compatibility for the selected reuse and destination. Maintain destination-specific rules with sources and review dates; do not promise that every open license is accepted by every Wikimedia project.
- Maintain a rights record for each imported or authored asset: title, creator, source URL, license and version, license URL, required notices, modifications, provenance, permission evidence where applicable, and review status. Preserve existing rights information during import. Unknown rights remain unresolved; AI-generated suggestions and search results do not establish permission.
- Separate academic citation from copyright attribution. Generate editable credits using title, author, source, and license where available, plus required notices and modification statements. Carry attribution into HTML, EPUB, PDF, editable source packages, and Wikimedia exports. Include usable printed source and license references, not links conveyed only through clickable text.
- Support mixed-rights works with explicit exclusions from the project license. Never overwrite a third party's license with the author's selected license. Identify potentially incompatible combinations for review. Keep contextual legal exceptions, such as fair use, distinct from permission under an open license; do not treat an exception as authorization for unrestricted redistribution.
- Help authors find and evaluate openly licensed replacements, adapt materials, document changes, and preserve source relationships. Export editable source and assets when permitted so others can revise the work. Provide guidance at the point of need without requiring authors to complete an OER course before creating content.
- Before an OER or destination-specific release, summarize the selected license, included and excluded material, generated attribution, and unresolved rights questions. Allow draft saving, but do not label unresolved material OER-ready or automatically publish material whose required permission has not been established.

## Architecture

Use one structured content model for headings, paragraphs, lists, figures, alternatives, tables, equations, media alternatives, activities, citations, language, and rights metadata. Build format-specific exporters from that model. Preserve accessibility semantics through import, editing, and conversion; do not use a visual PDF as the canonical source.

The interface may be hosted on GitHub Pages. Server-dependent validation or conversion requires a separately designed processing service or local companion. Do not put course exports or credentials in a public repository. Prefer local processing where practical; make external processing explicit.

## Standards and acceptance strategy

- Minimum: WCAG 2.1 Level A and AA. Engineering target: WCAG 2.2 AA plus explicit coverage of 2.1 requirements, including 4.1.1 Parsing (removed in 2.2).
- Map ADA Title II obligations and applicable Revised Section 508 requirements separately; a WCAG pass does not establish universal legal compliance.
- Evaluate assistive-technology interoperability, accessible authoring support, and preservation of accessibility information under applicable Chapter 5 requirements.
- Use ATAG 2.0 Parts A and B to guide an accessible editor that helps authors produce accessible content.
- Maintain an applicability and version matrix for international markets, including EN 301 549. Do not promise compliance with all countries' laws from one checklist or assume a newly published edition has been adopted in every jurisdiction.
- EPUB: target EPUB Accessibility 1.1 and applicable WCAG requirements; validate EPUB structure and accessibility separately and report metadata honestly.
- PDF: select an explicit PDF/UA target based on exporter and reading-system support; preserve real tags, language, headings, lists, table relationships, alternatives, bookmarks, and logical reading order. Printing to PDF or adding tags alone is insufficient.

## Required product behavior

All essential authoring and export operations must be keyboard usable, with visible focus, accessible names, predictable focus handling, and announced validation/progress. Drag-and-drop must have equivalent controls. Support reflow, magnification, sufficient contrast, non-color cues, reduced motion, and accessible authentication where present.

Keep existing meaningful alternatives and table semantics. Flag ambiguous structure, missing media alternatives, complex diagrams, equations, inaccessible attachments, and unavailable external content. AI suggestions do not become verified equivalents automatically.

Provide a focused repair queue and evidence-based output status: unresolved issues, automated checks completed, human review pending, or conformance established for a defined version and scope. Never mark an unchecked export accessible or compliant. Allow draft saving without misrepresenting it as a finished accessible publication.

## Release verification

Automated checks are necessary but insufficient. Require keyboard and focus tests, screen-reader testing with documented browser/reader combinations, magnification and reflow checks, export structure checks, and visual print inspection. Include users with disabilities in usability evaluation. Test complete tasks, including import errors and recovery, authoring, remediation, export, and publishing.

Maintain a conformance matrix, test evidence, known limitations, and regression checks. Known failures of mandatory applicable criteria block the affected release/conformance claim. Provide an ACR when supported by evaluation evidence; a VPAT template is not certification.

## Primary references

- https://www.ada.gov/resources/2024-03-08-web-rule/
- https://www.access-board.gov/ict/
- https://www.w3.org/TR/WCAG21/
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/standards-guidelines/atag/
- https://www.etsi.org/technical-groups/hf/
- https://www.w3.org/TR/epub-a11y/
- https://pdfa.org/accessibility/
- https://www.unesco.org/en/open-educational-resources/mandate
- https://creativecommons.org/chooser/
- https://creativecommons.org/cc-license-your-work/
- https://wiki.creativecommons.org/wiki/Before_Licensing

This document records project requirements and intended verification, not completed implementation or a conformance claim.
