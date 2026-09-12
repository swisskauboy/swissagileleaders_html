# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static marketing site for Swiss Agile Leaders (swissagileleaders.org), hand-written HTML/CSS/JS with **no build step, no package manager, no dependencies, and no tests**. Content is bilingual German/English, switched client-side. German is the source language; English is largely AI-translated (the footer says so).

## Commands

```powershell
python -m http.server 8080     # local server, then open http://localhost:8080
.\scripts\deploy.bat -DryRun   # show what deploy would copy/delete
.\scripts\deploy.bat           # deploy
```

There is nothing to build, lint, or test — verify changes by loading the pages in a browser. Always serve over HTTP: every asset and link uses root-absolute paths (`/assets/...`, `/werte/`), so opening a file directly from disk breaks styling and navigation.

## Architecture

### Page-per-file, no templating

`/` is `index.html`; every other route is `<slug>/index.html` (`werte`, `agileunconference`, `services`, `erster-schritt`, `team`, `kontakt`, `impressum-and-legal`), plus `404.html`. All nine files carry a **copy-pasted header and footer**, marked by `<!-- SHARED HEADER ... -->` / `<!-- SHARED FOOTER ... -->` banners listing every file to update. Changing navigation, the CTA, or footer contact details means editing all nine files identically. The only per-page differences inside those blocks are `<title>`/`<meta name="description">` and the `aria-current="page"` marker on the active nav link.

Each `<body>` has `site-page` plus a `page-<name>` class for page-specific CSS hooks.

### Per-page SEO metadata

Every indexable page carries, after its `<meta name="description">`: a `<link rel="canonical">` (always the `https://swissagileleaders.org` origin — the site is also reachable as `swissagileleaders.ch`, which is exactly what the canonical disambiguates), an Open Graph block (`og:type/site_name/locale/url/title/description/image` plus image dimensions and alt), and `twitter:card`. `og:image` must be an **absolute URL to a raster file** — crawlers do not reliably read the AVIF/WebP variants — with `og:image:width`/`height` matching the file's real pixel size. `404.html` deliberately has none of this and carries `<meta name="robots" content="noindex">` instead.

JSON-LD lives in a `<script type="application/ld+json">` just before `</head>`: `Organization` + `WebSite` on the home page, `Event` on the Agile Unconference page, and `AboutPage`/`Organization.member` with a `Person` per team member on the team page. The `Organization` is defined once on the home page under `@id` `https://swissagileleaders.org/#organization`; the other pages reference that same `@id` rather than redefining it.

### Central CSS and JS

- [assets/site.css](assets/site.css) — the entire stylesheet. Design tokens are CSS custom properties on `:root` (`--bg`, `--accent`, `--radius`, `--container`, …); prefer them over literal colors. Three breakpoints: `1160px` (nav spacing), `1280px` (**hamburger menu turns on and grids collapse — not the usual 768px**), `640px` (single column; the header CTA is hidden entirely).
- [assets/site.js](assets/site.js) — one IIFE running eight `init*` functions on every page. Each returns early when its `data-*` hook is absent, so the same file is safe everywhere. No modules, no framework.

### HTML↔JS contract (data attributes)

JS finds everything through these hooks; markup without them is inert:

| Hook | Behavior |
| --- | --- |
| `data-nav-toggle` / `data-nav` | hamburger menu, toggles `.is-open` |
| `data-lang-btn="de\|en"` | language switch |
| `data-i18n-de` / `data-i18n-en` | translated node (both required) |
| `data-i18n-de-mobile` / `data-i18n-en-mobile` | optional ≤640px override |
| `data-ai-translation-note="de\|en"` | footer note shown only in that language |
| `data-slider` + `.quote-slide` | quote rotator (auto-advances every 6.5 s) |
| `data-gallery-track`, `data-gallery-prev/next` | horizontal gallery scrolling |
| `data-lightbox-gallery` | click-to-zoom overlay, built in JS at runtime |
| `data-stagger` + `.reveal` | IntersectionObserver fade-in with staggered delay |
| `id="year"` | footer copyright year |

### Language switching

`initLanguageToggle` reads `data-i18n-<lang>` and assigns it via **`innerHTML`**, so attribute values may contain markup (e.g. `data-i18n-de="<strong>Telefon:</strong> total überbewertet"`). The choice persists in `localStorage` under `sal_lang` (default `de`) and sets `<html lang>` to `de-CH` or `en`.

Consequences when editing copy:

- The element's inline text is only a no-JS fallback and the initial German render. **German copy lives in two places — the inline text and `data-i18n-de` — and both must be changed together.** They have drifted before (the `kontakt` hero intro differs between them).
- Every translated element needs both `data-i18n-de` and `data-i18n-en`; an element with only one is skipped entirely.
- Untranslated content (names, email addresses, `<title>`, meta descriptions) simply has no `data-i18n-*` attributes and stays German.

### Images

Stored under `assets/img/<brand|events|team|contact|icons|flags|partners|mural>/`. Photos use `<picture>` with AVIF → WebP → raster fallback, all three variants committed next to each other; give the fallback `<img>` explicit `width`/`height` where the layout depends on it. The lightbox reads `img.currentSrc`, so it shows whichever format the browser picked.

### Deployment

[scripts/deploy.bat](scripts/deploy.bat) is a thin wrapper around [scripts/deploy.ps1](scripts/deploy.ps1), which:

1. Scans every `.html`/`.css`/`.js` for mojibake sequences (`Ã`, `Â`, `â€`, `�`) and **aborts the deploy** if any are found. German umlauts make this a real hazard — always save as UTF-8 (enforced by [.editorconfig](.editorconfig): UTF-8, LF, 2-space indent; CRLF for `.ps1`/`.bat`).
2. Copies an **explicit allowlist** (`$publishItems`: `index.html`, `robots.txt`, `sitemap.xml`, the seven page directories, and `assets`) into a temp staging dir.
3. Mirrors staging to `D:\Nextcloud (aragost)\public\swissagileleaders_html` with `robocopy /MIR` — destination files not in the allowlist are deleted.

Anything missing from `$publishItems` never reaches the deploy target, so new top-level files must be added there explicitly. That allowlist is also why retired assets go to the top-level [archive/](archive/) directory rather than somewhere under `assets/`: archived files stay in the repo but stop being published, and `/MIR` then deletes them from the live target. `404.html` and `README.md` are currently excluded by design — `README.md` is internal, and `404.html` only does anything if the hosting layer is configured to serve it as the error page. Override the target with `-Destination`, or the source with `-Source`.

## Adding a page

1. Copy an existing page directory as `<slug>/index.html`; update `<title>`, meta description, the `page-*` body class, and the whole canonical/Open Graph block (every one of those tags is page-specific).
2. Add the nav entry to all nine HTML files, and move `aria-current="page"` onto the new link in the new file only.
3. Add the URL to [sitemap.xml](sitemap.xml).
4. Add the slug to `$publishItems` in [scripts/deploy.ps1](scripts/deploy.ps1) — otherwise the page is silently left out of every deploy.
