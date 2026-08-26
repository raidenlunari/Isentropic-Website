# Isentropic Robotics Website — Design Specification

**Date:** 2026-08-25
**Status:** Approved for planning

## 1. Purpose

Isentropic Robotics is an international competitive robotics nonprofit. Its official description, to be reproduced verbatim on the homepage:

> Isentropic Robotics fosters STEM education through support for competitive robotics and community events for aspiring engineering students.

The website serves four audiences: prospective student participants and their families, prospective sponsors, prospective volunteers and staff, and the wider robotics research community. It must be maintainable indefinitely by board members who are not web developers.

## 2. Constraints

| Constraint | Decision |
|---|---|
| Visual reference | Physical Intelligence (https://www.pi.website/) |
| Framework | Astro, static output |
| Content authoring | Markdown files, one per entry |
| Hosting | Netlify |
| Form handling | Netlify Forms |
| Initial content | Clearly-marked placeholder scaffold |
| Identity | PI palette and card system, one Isentropic signature device |
| Language register | Academic and professional throughout |

## 3. Design tokens

Extracted from the reference implementation and reproduced exactly.

### 3.1 Color

| Token | Value | Use |
|---|---|---|
| `--background` | `#F5F4EF` | Page ground |
| `--background-hover` | `#EBEAE5` | Standard card hover fill |
| `--foreground` | `#000000` | Primary text, major card border and shadow |
| `--muted-foreground` | `#686868` | Dates, summaries, secondary text |
| `--card` | `#FFFFFF` | Major card fill |
| `--card-soft` | `rgba(255,255,255,0.6)` | Progress card fill |
| `--border-soft` | `#D4D3CB` | Progress card border |
| `--border-soft-hover` | `#C0BDAD` | Progress card hover border and shadow |

No dark mode. The reference commits to a single look and the palette depends on it. The page paints `--background` explicitly on `body`.

### 3.2 Type

Two layers, mirroring the reference.

**Chrome layer** — navigation, index pages, cards, forms, labels. System monospace stack: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`. Base 14px / 20px. Card titles 12px / 20px at weight 600. Dates and summaries 12px at `--muted-foreground`.

**Reading layer** — article bodies and long-form prose.

- Display: **Instrument Serif** 400, self-hosted. Substitutes for Signifier, which is a licensed Klim face and cannot be redistributed. Article `h1` at 60px on desktop, 40px on mobile, `text-wrap: balance`, tight leading.
- Body: **Source Sans 3** 400/600, self-hosted. 18px / 1.625.

### 3.2.1 Wordmark

The wordmark is `Isentropic Robotics (φ)`, set in the display serif at 30px against monospace navigation, mirroring the reference's `Physical Intelligence (π)`.

The glyph is lowercase phi, U+03C6, in its looped form. Two constraints govern the choice of display face:

1. **The face must carry the Greek block.** If it does not, the φ falls back to a system serif and renders at a different stroke contrast and vertical proportion than the surrounding letters, inside the wordmark itself. Glyph coverage is verified before the face is committed; if Instrument Serif lacks Greek, the display face changes to one that has it rather than setting a single glyph in a second serif.
2. **The rendered form must be the looped φ, not the straight-stroked ϕ (U+03D5).** Some faces map U+03C6 to the straight form. This is checked visually, not assumed from the codepoint.

A fallback rule sets `font-feature-settings` and an explicit fallback stack on the wordmark so the glyph degrades to a known serif rather than to the monospace chrome face.

Both families are self-hosted as WOFF2 with `font-display: swap` and full fallback stacks. No external font requests.

### 3.3 Layout

- Index pages: content column capped at 1120px, centered, horizontal padding 24px. The reference sets no explicit cap here; 1120px is a deliberate choice, since an unbounded monospace index becomes unreadable on wide displays.
- Article pages: prose column capped at 768px, centered. Figures may break out to 1024px.
- Cards: padding `8px 12px`, inset 24px from the rail, 16px vertical gap between entries.

## 4. The rail — signature device

The reference hangs its post list off a vertical timeline with 7px square dots positioned 40px left of the card edge. Isentropic extends this into a **constant-interval scale**, named for the thermodynamic process the organization is named after: entropy held constant across the interval.

- A 1px vertical rule in `--border-soft` runs the full length of the list.
- Every entry places a tick on the rule, vertically aligned to the first text baseline.
- The year is printed on the rule at each year boundary, in 12px monospace at `--muted-foreground`, with the background color as an outline so the rule appears to pass behind it.
- The tick encodes tier:

| Tier | Tick |
|---|---|
| `major` | 7px filled square, `--foreground` |
| `progress` | 7px square, 1px border `--foreground`, transparent center |
| `standard` | 7px by 1px hairline, `--border-soft-hover` |

The rail is the single bold element. Everything around it stays quiet. The same component renders the Community events timeline, so the device appears twice and reads as a system rather than an ornament.

## 5. Card tiers

Three tiers, mapped exactly as specified in the brief.

**`major`** — product releases, full camp updates. White fill, `1px solid #000` border, `box-shadow: 3px 3px 0 #000`. Hover raises the shadow to `5px 5px 0 #000`. Internal gap 8px. Summary at 14px.

**`progress`** — progress updates. Fill `rgba(255,255,255,0.6)`, `1px solid #D4D3CB` border. Hover sets the border to `#C0BDAD`, adds `box-shadow: 3px 3px 0 #C0BDAD`, and fills to solid white. Internal gap 8px.

**`standard`** — everything else. No border, no shadow. Hover fills `#EBEAE5`. Internal gap 4px.

All three share the same internal structure: a baseline-aligned row with the title at left and the date at right, then the summary beneath. Titles truncate; dates never shrink. Transitions run 150ms and are suppressed under `prefers-reduced-motion`.

## 6. Content model

Six collections under `src/content/`, each validated by a Zod schema in `src/content.config.ts`. Invalid frontmatter fails the build with a readable message rather than silently dropping an entry.

### 6.1 `blog/` — the routing decision

```yaml
---
title: "2026 Summer Robotics Camp: Program Report"
date: 2026-08-12
summary: "One or two sentences, shown on the index cards."
tier: major              # major | progress | standard
topics: [community]      # community | research | product, zero or more
draft: false             # optional, defaults false
---
```

`tier` selects the card style. `topics` selects the pages the post appears on:

| Page | Filter |
|---|---|
| Homepage | All posts, newest first |
| Community | `topics` includes `community` |
| Research | `topics` includes `research` |
| Products | `topics` includes `product` |

A post carrying two topics appears on both pages. This is the central maintainability property: **one file, two fields, and the post routes itself to every page it belongs on.** No separate index to update, and no way for a post to reach the homepage while being forgotten on its topic page.

`draft: true` excludes a post from every listing and from the build.

### 6.2 `board/`

Fields: `name`, `role`, `photo`, `alt`, `order`. Body is the description paragraph.

Four entries at launch: Moon Liu, Jay Wang, Owen Fong, Stuart Li. `alt` is a required field so no headshot can ship without a text alternative. `order` controls display sequence.

### 6.3 `events/`

Fields: `title`, `date`, `location`, `summary`. Body is the expanded detail shown when the row is opened: attendance, partner organizations, outcomes.

### 6.4 `research/`

Fields: `title`, `date`, `authors` (array), `abstract`, `synopsis`, `manuscriptAvailable` (boolean). Body is the extended detail shown in the dropdown: methods, results, references. `manuscriptAvailable` gates the request form.

### 6.5 `products/`

Fields: `title`, `kind` (`hardware` or `software`), `status`, `summary`, `links` (array of label and url). Body is the expanded detail: specifications, requirements, documentation.

### 6.6 `roles/`

Fields: `title`, `category`, `location`, `commitment`, `open` (boolean), `order`. Body covers responsibilities and qualifications.

Roles are grouped by `category` on the Contribute page and populate the application form's role select. Setting `open: false` retires a role without deleting the file.

### 6.7 Site-level data

`src/data/site.ts` holds the organization name, official description, contact email, social links, sponsor packet path, and the Netlify form names. Values that appear in more than one place are defined here once.

## 7. Pages

### 7.1 Homepage

1. Wordmark and navigation.
2. Official description, verbatim, in the chrome layer at 14px.
3. **Board.** Four cards in a responsive grid: four columns at desktop, two at tablet, one at mobile. Each card carries a square headshot, name, role, and description. Images are lazy-loaded below the fold with explicit dimensions to prevent layout shift.
4. **Updates.** The full rail, newest first, all three tiers.

### 7.2 Community

1. Section introduction.
2. **Events timeline.** The rail component, one row per event, each row a disclosure that expands to the event's full detail. Ordered newest first.
3. **Community updates.** Posts filtered to `topics` including `community`.

### 7.3 Research

1. Section introduction.
2. **Research entries.** Each entry shows title, authors, date, and abstract. A disclosure expands to the synopsis and extended detail, followed by a **Request Full Manuscript** form scoped to that entry. Entries with `manuscriptAvailable: false` render the detail without the form.
3. **Research updates.** Posts filtered to `topics` including `research`.

### 7.4 Products

1. Section introduction.
2. **Product boxes.** Grouped by `kind`, hardware before software. Each box shows title, status, and summary, with a disclosure expanding to specifications and links.
3. **Product updates.** Posts filtered to `topics` including `product`.

### 7.5 Contribute

1. **Sponsors.** Explanation of sponsorship, a prominent link to the sponsor packet PDF with file type and size stated, and the sponsor contact form.
2. **Join Us.** Open roles grouped by category as disclosure rows, following the reference's plus affordance. Beneath them, the application form, including the `<insert-role-you-excel-at/>` option for applicants who do not match a listed role.

### 7.6 Article pages

Generated from `blog/` at `/blog/<slug>`. Reading layer: Instrument Serif display title, publication date, contact email, then prose in Source Sans 3. Prose styles cover headings, lists, blockquotes, inline and block code, tables, figures with captions, and links.

### 7.7 Confirmation page

`/thanks` confirms submissions from clients without JavaScript. It states which form was received and what happens next.

## 8. Components

| Component | Responsibility |
|---|---|
| `BaseLayout` | Document shell, fonts, tokens, skip link, nav, footer |
| `ArticleLayout` | Reading-layer prose column, article metadata |
| `Nav` | Wordmark and five links, current-page state, mobile disclosure |
| `Footer` | Contact, socials, copyright |
| `Rail` | The constant-interval scale: rule, ticks, year markers |
| `PostCard` | One entry in three tier variants |
| `Disclosure` | Native details and summary elements with a plus affordance |
| `BoardCard` | Headshot, name, role, description |
| `Form` | Shared field primitives, validation display, submit state |

`Disclosure` serves events, research entries, products, roles, and mobile navigation. Built on native elements it is keyboard-accessible without custom JavaScript, functions with JavaScript disabled, and expands when the page is printed.

## 9. Forms

All three use Netlify Forms. Each carries `data-netlify="true"`, a unique `name`, a matching hidden `form-name` input, and a honeypot field declared via `netlify-honeypot="bot-field"`.

Behavior is progressively enhanced. Without JavaScript the form performs a normal POST and lands on `/thanks`. With JavaScript it submits via `fetch`, disables the submit control, and renders an inline success state without navigation. Failures render an inline error with the reason and leave entered values intact.

Validation uses native HTML5 constraints (`required`, `type="email"`, `pattern`, `maxlength`) with `aria-describedby` wiring each field to its error message. Errors state what is wrong and how to correct it.

### 9.1 Sponsor contact

Form name `sponsor-contact`. Fields: organization, contact name, email, sponsorship level of interest, message.

### 9.2 Request Full Manuscript

Form name `manuscript-request`. Fields: name, email, affiliation, intended use. A hidden `manuscript` field carries the entry title so each request is attributable to a specific work. One instance renders per research entry; all instances share the single form name and are distinguished by the hidden field.

### 9.3 Application

Form name `application`. Fields: name, email, role select, links, resume upload, message. The role select is generated from open roles and always includes the `<insert-role-you-excel-at/>` option. The form sets `enctype="multipart/form-data"` for the upload.

### 9.4 Detection stub

Netlify detects forms by parsing deployed HTML at build time. A hidden static stub at `public/__forms.html` declares all three form names and every field, guaranteeing detection independent of how a page renders. This is the documented mitigation for forms whose fields are generated from content collections.

## 10. Quality floor

- Responsive from 360px upward. No horizontal page scroll at any width; wide tables and code blocks scroll within their own container.
- Visible focus indicators on every interactive element, never removed.
- A skip link to main content, semantic landmarks, and a single `h1` per page.
- `prefers-reduced-motion: reduce` suppresses all transitions and transforms.
- Color contrast meets WCAG AA. `#686868` on `#F5F4EF` measures 5.06:1, clearing the 4.5:1 threshold for normal text. Muted text is never the sole carrier of essential information.
- Images carry explicit dimensions and schema-required alt text.
- Per-page metadata, Open Graph tags, `sitemap.xml`, and an RSS feed at `/rss.xml` generated from the blog collection.

## 11. Handover

`CONTENT-GUIDE.md` at the repository root, written for a non-technical maintainer. It covers adding a blog post, adding a board member, adding an event, adding a research entry, adding a product, opening and closing a role, replacing the sponsor packet, and where form submissions are collected. Each collection folder contains a `_TEMPLATE.md` with every field commented.

`README.md` covers local development, the build command, and the Netlify deployment settings.

## 12. Deliverables

1. Astro project configured for static output on Netlify.
2. Token stylesheet reproducing the extracted palette, type, and spacing.
3. Nine components as specified in section 8.
4. Six content collections with Zod schemas and templates.
5. Six static page routes (`/`, `/community`, `/research`, `/products`, `/contribute`, `/thanks`), the dynamic article route `/blog/<slug>`, and the generated `/rss.xml` and `/sitemap.xml`.
6. Three working forms and the detection stub.
7. Placeholder content: four board entries; eight blog posts, covering all three tiers and all three topics, with at least one post carrying two topics to exercise multi-page routing; four events; two research entries, one with `manuscriptAvailable: false`; two products, one hardware and one software; and four open roles across at least two categories.
8. Placeholder assets at final paths: four headshots, one sponsor packet PDF.
9. `CONTENT-GUIDE.md`, `README.md`, `netlify.toml`.

## 13. Out of scope

- Content management interface. Deferred; the Markdown model supports adding one later without restructuring.
- Search, pagination, comments, analytics, newsletter, donation processing, and authentication. None are required by the brief.
- Dark mode. The committed palette is single-look by design.
