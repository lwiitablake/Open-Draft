# Open Draft — wiki-first working prototype

**Version 0.1.0 · Released October 16, 2026**  
**Original app and documentation: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)**

See [LICENSE.md](LICENSE.md) for scope and third-party exclusions, [CHANGELOG.md](CHANGELOG.md) for release history, and [How this was built](docs/about.html) for the public development disclosure. User-created/imported content retains its own rights and licenses.

## How this was built

The project owner supplied the concept, wiki-first priorities, and accessibility/OER requirements. OpenAI Codex assisted with design, implementation, documentation, and automated tests. No AI service runs inside the deployed app or processes visitors' files.

The app uses HTML5, CSS, and plain JavaScript, with a versioned JSON content model, browser FileReader/Blob APIs, and sessionStorage. Custom serializers generate wiki source and semantic reading HTML. Locally bundled JSZip 3.10.1 creates ZIP downloads under its MIT license option. The static site requires no compilation or backend and can be served from GitHub Pages.

Development checks used Node.js tests, Playwright with Microsoft Edge, axe-core 4.10.3, and Python/Poppler for archive and print-proof checks. See QA.md for evidence, environmental limits, and remaining human checks. This is not an independently audited or certified accessible release.

The application version is separate from project-file schema version 1. When releasing an update, keep the visible version/date in index.html, about.html, guide.html, core.js BUILD, LICENSE.md, and this README aligned; record the change in CHANGELOG.md.

A browser-local authoring workspace for English Wikibooks and Wikimedia Commons. No account, API keys, build step, backend, or automatic publication. The name is provisional; this is not an official Wikimedia tool.

## Start here

The deployable app is in `docs/`. Serve that folder with any local static server, then open its local URL. If Python is installed:

```powershell
python -m http.server 8768 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:8768/`. Stop the server with Ctrl+C. Use HTTP or HTTPS instead of double-clicking index.html: file URL storage and clipboard behavior vary by browser.

## Publish on GitHub Pages — no build required

1. Create or open your chosen GitHub repository. Upload the contents of this project folder, keeping the `docs` folder and its `vendor` folder intact. Do not accidentally add an extra directory level above `docs`.
2. Confirm the repository contains `docs/index.html`, `docs/app.js`, `docs/core.js`, `docs/styles.css`, `docs/guide.html`, `docs/.nojekyll`, and `docs/vendor/jszip.min.js` plus its license. Keep `.nojekyll` when uploading with Git; the app does not need Jekyll.
3. In the repository, select **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your branch (usually **main**) and folder **/docs**, then **Save**.
5. Wait for the Pages deployment in the repository’s Actions area. Use the URL GitHub displays in Settings → Pages, typically `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
6. Open that URL and test: create a sample project, change its title, download JSON, refresh, reopen JSON, download a contribution ZIP, and inspect its files. Also test on a phone and with keyboard only.
7. To update the app, commit new files to the same branch and folder. No API token belongs in this app or repository.

If you prefer the repository root, place the contents of `docs/` in the root and choose `/(root)` instead. All app assets use relative paths and work in a project subdirectory. A custom GitHub Actions workflow is unnecessary for this buildless version.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

GitHub Pages hosting availability depends on repository/account settings. Pages websites may be public even when their repository is private. Commit the app source, not private course exports or user projects.

## What works

- Create/reopen a project; download JSON with embedded original raster images.
- Automatic tab-session working copy, visible failure feedback, memory-only mode, explicit clearing, and a reminder when leaving with changes not yet downloaded.
- Multiple pages; paragraphs, H2/H3 sections, lists, quotations, and image blocks; keyboard-accessible move controls.
- Source records and generated footnotes; separate media attribution, licenses, rights evidence, alternative text, captions, and change records.
- Review prompts and human acknowledgments that reset after edits/import.
- Wikibooks ZIP: book landing page and chapter wikitext, page map, media files and Commons descriptions, attribution, check report, editable project, reading HTML, and publication instructions.
- Commons ZIP: media and descriptions, attribution, check report, editable project, and publication instructions. Book pages are retained in the project but excluded from publication files.
- Standalone HTML reading/print draft. Local/private projects do not require an open license.

## Deliberate prototype limits

This is a reviewable prototype, not a conformance-certified production service. Automated checks cover selected errors; they do not establish legal permission, destination acceptance, or WCAG/ADA/508 conformance. See QA.md for tests and remaining manual evaluation.

No IMSCC, EPUB, verified tagged PDF, tables/equations, audio/video, direct wiki API publication, external resource search, or multilingual metadata yet. English Wikibooks and Commons are the only destination adapters. Other wikis need their own policies and exporter. Unsupported project files are rejected instead of partially converted.

Project limits: 4 MB, 50 pages, 200 blocks/page, 100 references, 20 images; 1.5 MB/image and 40 megapixels/image. Download before leaving. sessionStorage is a working copy, not a backup; browser recovery can retain it. The app does not encrypt local data. Browser/profile security still applies.

## Files and development

`docs/core.js`: pure model validation, checks, escaping, wiki and HTML serializers. `docs/app.js`: form rendering, user events, storage, import, and downloads. `docs/styles.css`: responsive, print, and focus styles. `tests/`: regression checks. `DESIGN-REVIEW.md`: two pre-implementation reviews. `PROJECT-REQUIREMENTS.md`: broader product requirements.

The runtime has one vendored dependency: JSZip (see `docs/vendor/JSZIP-LICENSE.md`). No runtime CDN. Retain its license when redistributing. The original app and documentation use CC BY-NC-SA 4.0, as selected by the project owner. JSZip retains its MIT license. The content-license picker controls project metadata, not the application license.

Run pure tests with Node: `node --test tests/core.test.cjs`. Browser QA scripts require Playwright in your development environment; see QA.md. They are not required to deploy or use the app.

## Next milestones

1. Test with wiki contributors and people using assistive technology; validate exported pages in a real sandbox before public release.
2. Add existing-Commons-file selection, more license situations, and per-use image alternatives.
3. Add local IMSCC parsing with full resource inventory and explicit unsupported-item reporting; keep assessments/instructor material separate.
4. Extend the structured model for tables, equations, multilingual content, and media alternatives.
5. Add EPUB validation and a tagged PDF pipeline with reading-system and accessibility verification.
6. Consider larger IndexedDB working copies and explicit authorized wiki publishing. Retain user-controlled downloads and publication review.
