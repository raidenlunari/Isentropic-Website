# Isentropic Robotics website

A static site for Isentropic Robotics, a competitive robotics nonprofit,
built with [Astro](https://astro.build). It publishes five pages, a
blog, and a content-driven set of board members, events, research
entries, products, and volunteer roles, backed by three Netlify forms.

For editing site content — blog posts, board members, events, research,
products, and roles — see [`CONTENT-GUIDE.md`](./CONTENT-GUIDE.md). This
file is for developers working on the code itself.

## Local development

```bash
npm install
npm run dev
```

This starts the Astro dev server (default `http://localhost:4321`) with
hot reload.

## Build

```bash
npm run build
```

Outputs the static site to `dist/`. Run `npm run preview` afterward to
serve that built output locally, as a quick sanity check before deploying.

## Typecheck

```bash
npm run typecheck
```

Runs `astro check` (Astro's own type checker, which understands `.astro`
files and content collection schemas, not just plain `.ts`).

## Tests

```bash
npm run test:unit   # Vitest, unit tests (src/lib, schemas), runs once and exits
npm run test:e2e    # Playwright, end-to-end tests against the built site
npm run test        # typecheck, then test:unit, then test:e2e
```

`npm run test:unit` runs Vitest in single-run mode. For interactive watch
mode while writing tests, use `npm run test:unit:watch` instead — `test`
and `test:unit` are both meant to exit on their own for use in scripts
and CI, so neither one watches.

`npm run test:e2e` builds the site and serves the built `dist/` output on
port 4321 before running the Playwright suite against it (see
`playwright.config.ts`). Because `reuseExistingServer` is `false`, it will
fail loudly if anything is already listening on port 4321 — close any
running `astro preview` or other server on that port first.

### Testing conventions worth knowing before "simplifying" them

A few choices in this test suite look unusual and are deliberate. Please
read this before changing them:

- **End-to-end tests run against the built (`dist/`) output, never the
  dev server, and `reuseExistingServer` is always `false`.** This was
  not the original setup — testing against the dev server once hid a
  real bug where the navigation's `aria-current="page"` attribute never
  fired in the actually-shipped HTML, because the dev server's rendered
  markup for the current route diverged from the static build's. If you
  are tempted to point `playwright.config.ts` at `astro dev` for faster
  iteration, don't — it can pass locally while shipping something
  broken.
- **Font and typography assertions measure text on a `<canvas>` element
  instead of reading `getComputedStyle(...).fontFamily`.** A computed
  style only reports the font stack the CSS *asked for* — it still says
  `"EB Garamond Variable", ...` even if that font file failed to load
  and the browser silently substituted a fallback. Rendering the same
  string in the claimed font and in a known fallback and comparing the
  measured widths (see `tests/e2e/wordmark.spec.ts` and
  `tests/e2e/article.spec.ts`) actually proves the intended font is what
  rendered.
- **Heading structure (single `h1`, no skipped levels, body headings
  starting at `h2`) is asserted directly against the DOM**, rather than
  left to axe's accessibility sweep alone. axe's `heading-order` rule
  only flags a *skipped increase* (`h2` straight to `h4`); it does not
  catch an inverted or otherwise malformed outline (for example, an
  `h4` appearing before the `h2` it should nest under). The explicit
  assertions in `tests/e2e/article.spec.ts` and `tests/e2e/shell.spec.ts`
  cover what axe cannot.

If you change any of these to something that looks simpler, first check
whether it can still catch the specific bug it was written to catch.

## Deployment (Netlify)

- **Build command:** `npm run build`
- **Publish directory:** `dist`

Both are also set in `netlify.toml`, checked into the repository, so a
fresh Netlify site pointed at this repository picks them up
automatically.

The production domain, `https://isentropic.tech`, is set as `site` in
`astro.config.mjs`. It is used to build the canonical URLs, RSS feed
links, and sitemap that Astro generates at build time — update it there
if the domain ever changes.

### Form submissions

The site's three forms (sponsor inquiries, manuscript requests, and
volunteer applications) are Netlify Forms — plain HTML forms with a
`data-netlify="true"` attribute, requiring no backend code or database
here. Submissions are collected under the **Forms** section of the
site's Netlify dashboard, and are not written anywhere in this
repository. Email notifications for new submissions are also configured
there, not in code.

## Project structure

```
src/
  content/       # Markdown content collections (blog, board, events,
                  # research, products, roles) — see CONTENT-GUIDE.md
  content.config.ts  # Zod schemas for every collection above
  pages/         # Astro routes
  components/    # Shared and per-feature Astro components
  layouts/       # Page shells (BaseLayout, ArticleLayout)
  lib/           # Framework-free helpers (sorting/filtering, dates,
                  # taxonomy, rehype plugins)
  styles/        # Global, unscoped CSS (tokens, prose)
public/          # Static files served as-is (images, the sponsor
                  # packet PDF, favicon)
tests/
  unit/          # Vitest — pure functions in src/lib
  e2e/           # Playwright — full pages against the built site
```
