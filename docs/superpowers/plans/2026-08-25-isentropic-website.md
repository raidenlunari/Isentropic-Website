# Isentropic Robotics Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a five-page static website for Isentropic Robotics, visually derived from Physical Intelligence, where all content is authored as Markdown files and all three forms submit successfully in production.

**Architecture:** Astro with static output. Six content collections under `src/content/`, each validated by a Zod schema, are the single source of truth. Pure functions in `src/lib/` do all filtering, sorting, and grouping so that routing logic is unit-testable without rendering. Astro components consume those functions and render. Forms are plain HTML enhanced by one small script, with Netlify Forms as the backend.

**Tech Stack:** Astro 5, TypeScript, Zod (bundled with Astro), Vitest (unit), Playwright + axe-core (end-to-end and accessibility), Fontsource (self-hosted EB Garamond and Source Sans 3), Netlify.

## Global Constraints

These apply to every task. Values are copied verbatim from `docs/superpowers/specs/2026-08-25-isentropic-website-design.md`.

- **Node:** 24.x is installed. Astro requires 18.20.8+, 20.3.0+, or 22+. Do not add an engines floor above 20.
- **Colors, exact values, no substitutions:** `--background: #F5F4EF`, `--background-hover: #EBEAE5`, `--foreground: #000000`, `--muted-foreground: #686868`, `--card: #FFFFFF`, `--card-soft: rgba(255,255,255,0.6)`, `--border-soft: #D4D3CB`, `--border-soft-hover: #C0BDAD`.
- **No dark mode.** Do not add `prefers-color-scheme` blocks. `body` paints `--background` explicitly.
- **Chrome font stack:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`. Base 14px/20px. Card titles 12px/20px weight 600. Dates and summaries 12px at `--muted-foreground`.
- **Display font:** EB Garamond 400. Must render U+03C6 from EB Garamond itself, not a fallback.
- **Body font:** Source Sans 3 400/600 at 18px/1.625, article prose only.
- **No external font requests.** Both families self-hosted via Fontsource.
- **Index content column:** max-width 1120px, centered, 24px horizontal padding.
- **Article prose column:** max-width 768px, centered.
- **Cards:** padding `8px 12px`, inset 24px from the rail, 16px vertical gap between entries.
- **Transitions:** 150ms, and every one suppressed under `prefers-reduced-motion: reduce`.
- **Copy register:** academic and professional. No exclamation marks, no marketing superlatives, no second-person sales copy.
- **Official description, reproduced verbatim, never paraphrased:** "Isentropic Robotics fosters STEM education through support for competitive robotics and community events for aspiring engineering students."
- **Board members, exact spellings:** Moon Liu, Jay Wang, Owen Fong, Stuart Li.
- **Commit after every task.** Co-author trailer: `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## File Structure

| Path | Responsibility |
|---|---|
| `astro.config.mjs` | Static output, site URL, sitemap integration |
| `netlify.toml` | Build command, publish directory |
| `src/styles/tokens.css` | All custom properties, resets, base type |
| `src/data/site.ts` | Organization constants used in more than one place |
| `src/content.config.ts` | Six Zod schemas |
| `src/lib/dates.ts` | Date formatting |
| `src/lib/posts.ts` | Draft stripping, sorting, topic filtering, year grouping |
| `src/lib/tiers.ts` | Tier to CSS class mapping |
| `src/layouts/BaseLayout.astro` | Document shell, nav, footer, skip link |
| `src/layouts/ArticleLayout.astro` | Reading-layer prose column |
| `src/components/Nav.astro` | Wordmark and five links |
| `src/components/Footer.astro` | Contact and copyright |
| `src/components/Rail.astro` | Constant-interval scale wrapper |
| `src/components/RailItem.astro` | One tick plus its slot content |
| `src/components/PostCard.astro` | Three tier variants |
| `src/components/BoardCard.astro` | Headshot, name, role, description |
| `src/components/Disclosure.astro` | Native details and summary |
| `src/components/forms/Field.astro` | Label, control, error region |
| `src/components/forms/NetlifyForm.astro` | Form shell with Netlify attributes |
| `src/scripts/forms.ts` | Progressive enhancement for all forms |
| `src/pages/*.astro` | Six static routes |
| `src/pages/blog/[...slug].astro` | Article route |
| `src/pages/rss.xml.ts` | Feed |
| `public/__forms.html` | Netlify form detection stub |
| `tests/unit/*.test.ts` | Vitest |
| `tests/e2e/*.spec.ts` | Playwright |

---

### Task 1: Project scaffold, tokens, and verified phi rendering

The riskiest assumption in the whole build is that the φ renders in the display serif. This task proves it before anything depends on it.

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `netlify.toml`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/styles/tokens.css`, `src/data/site.ts`, `src/pages/index.astro`
- Test: `tests/e2e/wordmark.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `src/data/site.ts` exporting `site` with fields `name: string`, `wordmark: string`, `phi: string`, `description: string`, `email: string`, `sponsorPacket: string`, `formNames: { sponsor: string; manuscript: string; application: string }`. All later tasks import from here.

- [ ] **Step 1: Scaffold the project**

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --skip-houston
npm install
npm install @fontsource-variable/eb-garamond @fontsource-variable/source-sans-3 @astrojs/sitemap
npm install -D vitest @playwright/test @axe-core/playwright
npx playwright install chromium
```

- [ ] **Step 2: Write `src/data/site.ts`**

```ts
export const site = {
  name: "Isentropic Robotics",
  wordmark: "Isentropic Robotics",
  phi: "φ",
  description:
    "Isentropic Robotics fosters STEM education through support for competitive robotics and community events for aspiring engineering students.",
  email: "contact@isentropic.tech",
  sponsorPacket: "/files/isentropic-sponsor-packet.pdf",
  formNames: {
    sponsor: "sponsor-contact",
    manuscript: "manuscript-request",
    application: "application",
  },
} as const;

export type Site = typeof site;
```

- [ ] **Step 3: Write `src/styles/tokens.css`**

Define every custom property from Global Constraints on `:root`. No media-query or attribute overrides for color. Then:

```css
:root {
  --background: #F5F4EF;
  --background-hover: #EBEAE5;
  --foreground: #000000;
  --muted-foreground: #686868;
  --card: #FFFFFF;
  --card-soft: rgba(255, 255, 255, 0.6);
  --border-soft: #D4D3CB;
  --border-soft-hover: #C0BDAD;

  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  --font-display: "EB Garamond Variable", "EB Garamond", Georgia, serif;
  --font-body: "Source Sans 3 Variable", "Source Sans 3", system-ui, sans-serif;

  --measure-index: 1120px;
  --measure-prose: 768px;
  --pad-x: 24px;
  --rail-offset: 24px;
  --tick-size: 7px;
  --transition: 150ms;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 20px;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; }

:focus-visible {
  outline: 2px solid var(--foreground);
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: var(--pad-x);
  top: 8px;
  z-index: 10;
  background: var(--card);
  border: 1px solid var(--foreground);
  padding: 8px 12px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Write a temporary `src/pages/index.astro` that exercises the wordmark**

```astro
---
import "@fontsource-variable/eb-garamond";
import "@fontsource-variable/eb-garamond/greek.css";
import "@fontsource-variable/source-sans-3";
import "../styles/tokens.css";
import { site } from "../data/site";
---
<html lang="en">
  <head><meta charset="utf-8" /><title>{site.name}</title></head>
  <body>
    <a class="wordmark" href="/">{site.wordmark} ({site.phi})</a>
    <style>
      .wordmark {
        font-family: var(--font-display);
        font-size: 30px;
        text-decoration: none;
      }
    </style>
  </body>
</html>
```

If `@fontsource-variable/eb-garamond/greek.css` does not resolve, run `ls node_modules/@fontsource-variable/eb-garamond/` and import the actual greek subset filename found there. Fontsource file naming varies by package version; do not guess it.

- [ ] **Step 5: Write the failing test**

```ts
// tests/e2e/wordmark.spec.ts
import { test, expect } from "@playwright/test";

test("phi renders in EB Garamond, not a fallback", async ({ page }) => {
  await page.goto("/");
  const mark = page.locator(".wordmark");
  await expect(mark).toContainText("φ");

  // A glyph served by a fallback face measures differently from one served by
  // EB Garamond. Compare the phi against a Latin character known to come from
  // EB Garamond: if the phi fell back, the ratio shifts sharply.
  const ratio = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector(".wordmark")!);
    const measure = (text: string, family: string) => {
      const c = document.createElement("canvas").getContext("2d")!;
      c.font = `30px ${family}`;
      return c.measureText(text).width;
    };
    const inFace = measure("φ", cs.fontFamily);
    const inFallback = measure("φ", "Georgia, serif");
    return inFace / inFallback;
  });
  expect(ratio).not.toBeCloseTo(1, 3);

  await expect(page).toHaveScreenshot("wordmark.png");
});
```

- [ ] **Step 6: Run it and confirm the phi assertion passes**

Run: `npx playwright test tests/e2e/wordmark.spec.ts --update-snapshots`
Then open `tests/e2e/wordmark.spec.ts-snapshots/wordmark.png` and **look at it**. Confirm two things by eye:
1. The φ is the looped form, not the straight-stroked ϕ.
2. The φ's stroke contrast and x-height match the surrounding Latin letters.

If either fails, switch `--font-display` to `"Alegreya"` (install `@fontsource-variable/alegreya`, which also carries greek) and repeat. Do not proceed with a mismatched glyph.

- [ ] **Step 7: Write `netlify.toml` and `astro.config.mjs`**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

`astro.config.mjs` sets `output: "static"`, `site: "https://isentropic.tech"`, and registers `@astrojs/sitemap`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Scaffold Astro project with verified phi wordmark rendering"
```

---

### Task 2: Content collections, schemas, and templates

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/{blog,board,events,research,products,roles}/_TEMPLATE.md`
- Test: `tests/unit/schemas.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: six collections named `blog`, `board`, `events`, `research`, `products`, `roles`, queryable via `getCollection()`. Exported types `Tier` and `Topic`.

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const TIERS = ["major", "progress", "standard"] as const;
export const TOPICS = ["community", "research", "product"] as const;
export type Tier = (typeof TIERS)[number];
export type Topic = (typeof TOPICS)[number];

const md = (dir: string) =>
  glob({ pattern: "**/[^_]*.md", base: `./src/content/${dir}` });

const blog = defineCollection({
  loader: md("blog"),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    summary: z.string().min(1),
    tier: z.enum(TIERS),
    topics: z.array(z.enum(TOPICS)).default([]),
    draft: z.boolean().default(false),
  }),
});

const board = defineCollection({
  loader: md("board"),
  schema: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    photo: z.string().min(1),
    alt: z.string().min(1),
    order: z.number().int(),
  }),
});

const events = defineCollection({
  loader: md("events"),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    location: z.string().min(1),
    summary: z.string().min(1),
  }),
});

const research = defineCollection({
  loader: md("research"),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    authors: z.array(z.string().min(1)).min(1),
    abstract: z.string().min(1),
    synopsis: z.string().min(1),
    manuscriptAvailable: z.boolean().default(true),
  }),
});

const products = defineCollection({
  loader: md("products"),
  schema: z.object({
    title: z.string().min(1),
    kind: z.enum(["hardware", "software"]),
    status: z.string().min(1),
    summary: z.string().min(1),
    links: z
      .array(z.object({ label: z.string().min(1), url: z.string().url() }))
      .default([]),
  }),
});

const roles = defineCollection({
  loader: md("roles"),
  schema: z.object({
    title: z.string().min(1),
    category: z.string().min(1),
    location: z.string().min(1),
    commitment: z.string().min(1),
    open: z.boolean().default(true),
    order: z.number().int().default(0),
  }),
});

export const collections = { blog, board, events, research, products, roles };
```

The glob pattern `**/[^_]*.md` excludes `_TEMPLATE.md` from every collection, so templates live beside real content without being validated or published.

- [ ] **Step 2: Write the six templates**

Each `_TEMPLATE.md` contains the full frontmatter with every field present and a comment above each explaining what it does and what values are legal. `src/content/blog/_TEMPLATE.md`:

```markdown
---
# The headline. Appears on index cards and at the top of the article.
title: "Replace with the post title"
# Publication date, YYYY-MM-DD.
date: 2026-01-01
# One or two sentences shown beneath the title on index cards.
summary: "Replace with a one or two sentence summary."
# Card style. Exactly one of:
#   major     - product releases and full camp updates (black border, hard shadow)
#   progress  - progress updates (soft grey border)
#   standard  - everything else (no border)
tier: standard
# Which pages this post appears on. Any of: community, research, product.
# Leave as [] to show only on the homepage. Add more than one to appear on
# more than one page.
topics: []
# Set to true to hide this post everywhere while you work on it.
draft: true
---

Write the post body here in Markdown.
```

Write the equivalent for the other five collections, using the field lists from spec sections 6.2 through 6.6.

- [ ] **Step 3: Write the failing schema test**

```ts
// tests/unit/schemas.test.ts
import { describe, it, expect } from "vitest";
import { TIERS, TOPICS } from "../../src/content.config";

describe("taxonomy", () => {
  it("defines exactly three tiers", () => {
    expect([...TIERS]).toEqual(["major", "progress", "standard"]);
  });
  it("defines exactly three topics", () => {
    expect([...TOPICS]).toEqual(["community", "research", "product"]);
  });
});
```

- [ ] **Step 4: Run it**

Run: `npx vitest run tests/unit/schemas.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add six content collections with schemas and authoring templates"
```

---

### Task 3: Pure content logic

All page routing lives here as testable functions. No component may filter or sort inline.

**Files:**
- Create: `src/lib/dates.ts`, `src/lib/posts.ts`, `src/lib/tiers.ts`
- Test: `tests/unit/posts.test.ts`, `tests/unit/dates.test.ts`

**Interfaces:**
- Consumes: `Tier`, `Topic` from `src/content.config.ts`.
- Produces:
  - `formatDate(d: Date): string` returning `"April 16, 2026"`
  - `sortByDateDesc<T extends { data: { date: Date } }>(items: T[]): T[]`
  - `publishedPosts<T extends { data: { draft: boolean } }>(items: T[]): T[]`
  - `filterByTopic<T extends { data: { topics: readonly Topic[] } }>(items: T[], topic: Topic): T[]`
  - `withYearMarkers<T extends { data: { date: Date } }>(items: T[]): Array<{ item: T; yearMarker: string | null }>`
  - `tierClass(tier: Tier): string`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/unit/posts.test.ts
import { describe, it, expect } from "vitest";
import {
  sortByDateDesc,
  publishedPosts,
  filterByTopic,
  withYearMarkers,
} from "../../src/lib/posts";

const post = (id: string, date: string, topics: string[] = [], draft = false) =>
  ({ id, data: { date: new Date(date), topics, draft } }) as any;

describe("publishedPosts", () => {
  it("removes drafts", () => {
    const out = publishedPosts([
      post("a", "2026-01-01"),
      post("b", "2026-01-02", [], true),
    ]);
    expect(out.map((p) => p.id)).toEqual(["a"]);
  });
});

describe("sortByDateDesc", () => {
  it("orders newest first", () => {
    const out = sortByDateDesc([
      post("old", "2025-01-01"),
      post("new", "2026-01-01"),
    ]);
    expect(out.map((p) => p.id)).toEqual(["new", "old"]);
  });
  it("does not mutate its input", () => {
    const input = [post("old", "2025-01-01"), post("new", "2026-01-01")];
    sortByDateDesc(input);
    expect(input.map((p) => p.id)).toEqual(["old", "new"]);
  });
});

describe("filterByTopic", () => {
  it("keeps posts carrying the topic", () => {
    const out = filterByTopic(
      [
        post("a", "2026-01-01", ["community"]),
        post("b", "2026-01-01", ["research"]),
      ],
      "community" as any,
    );
    expect(out.map((p) => p.id)).toEqual(["a"]);
  });
  it("keeps a post carrying two topics on both pages", () => {
    const both = post("both", "2026-01-01", ["community", "product"]);
    expect(filterByTopic([both], "community" as any)).toHaveLength(1);
    expect(filterByTopic([both], "product" as any)).toHaveLength(1);
  });
  it("excludes posts with no topics", () => {
    expect(filterByTopic([post("a", "2026-01-01", [])], "research" as any))
      .toHaveLength(0);
  });
});

describe("withYearMarkers", () => {
  it("marks only the first entry of each year", () => {
    const out = withYearMarkers([
      post("a", "2026-04-01"),
      post("b", "2026-01-01"),
      post("c", "2025-12-01"),
    ]);
    expect(out.map((e) => e.yearMarker)).toEqual(["2026", null, "2025"]);
  });
  it("returns an empty array unchanged", () => {
    expect(withYearMarkers([])).toEqual([]);
  });
});
```

```ts
// tests/unit/dates.test.ts
import { describe, it, expect } from "vitest";
import { formatDate } from "../../src/lib/dates";

describe("formatDate", () => {
  it("matches the reference format", () => {
    expect(formatDate(new Date("2026-04-16T00:00:00Z"))).toBe("April 16, 2026");
  });
  it("does not shift the day across timezones", () => {
    expect(formatDate(new Date("2026-01-01T00:00:00Z"))).toBe("January 1, 2026");
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/unit/`
Expected: FAIL, cannot resolve `src/lib/posts` and `src/lib/dates`.

- [ ] **Step 3: Implement `src/lib/dates.ts`**

```ts
const FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(d: Date): string {
  return FORMATTER.format(d);
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
```

`timeZone: "UTC"` is required. Frontmatter dates parse as UTC midnight, and formatting them in a negative-offset local timezone would render the previous day.

- [ ] **Step 4: Implement `src/lib/posts.ts`**

```ts
import type { Topic } from "../content.config";

type Dated = { data: { date: Date } };
type Draftable = { data: { draft: boolean } };
type Topical = { data: { topics: readonly Topic[] } };

export function sortByDateDesc<T extends Dated>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export function sortByDateAsc<T extends Dated>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => a.data.date.getTime() - b.data.date.getTime(),
  );
}

export function publishedPosts<T extends Draftable>(items: T[]): T[] {
  return items.filter((i) => !i.data.draft);
}

export function filterByTopic<T extends Topical>(items: T[], topic: Topic): T[] {
  return items.filter((i) => i.data.topics.includes(topic));
}

export function withYearMarkers<T extends Dated>(
  items: T[],
): Array<{ item: T; yearMarker: string | null }> {
  let previous: number | null = null;
  return items.map((item) => {
    const year = item.data.date.getUTCFullYear();
    const yearMarker = year === previous ? null : String(year);
    previous = year;
    return { item, yearMarker };
  });
}
```

- [ ] **Step 5: Implement `src/lib/tiers.ts`**

```ts
import type { Tier } from "../content.config";

export function tierClass(tier: Tier): string {
  return `card card--${tier}`;
}

export function tickClass(tier: Tier): string {
  return `tick tick--${tier}`;
}
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run tests/unit/`
Expected: PASS, all cases.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add tested content filtering, sorting, and year-grouping logic"
```

---

### Task 4: Shell, navigation, and footer

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro` to use the layout
- Test: `tests/e2e/shell.spec.ts`

**Interfaces:**
- Consumes: `site` from `src/data/site.ts`.
- Produces: `BaseLayout` accepting props `title: string`, `description?: string`, and a default slot. `Nav` accepting `pathname: string`.

- [ ] **Step 1: Write `src/components/Nav.astro`**

Renders the wordmark `Isentropic Robotics (φ)` in `--font-display` at 30px, with the φ wrapped in `<span class="phi">`. Then five links: Home `/`, Community `/community`, Research `/research`, Products `/products`, Contribute `/contribute`. The link whose href matches `pathname` gets `aria-current="page"` and underline. Nav is a `<nav>` inside `<header>`. Below 640px the links wrap to a second row rather than collapsing into a menu, since there are only five and they are short.

- [ ] **Step 2: Write `src/layouts/BaseLayout.astro`**

Imports the two Fontsource packages and `tokens.css`. Emits `<html lang="en">`, charset, viewport, title, meta description, Open Graph tags, canonical link, RSS `<link rel="alternate">`, the skip link, `<header>` with Nav, `<main id="main">` wrapping the slot inside a container capped at `--measure-index`, and `<footer>`.

- [ ] **Step 3: Write the failing test**

```ts
// tests/e2e/shell.spec.ts
import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/community", "/research", "/products", "/contribute"];

test("skip link reaches main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#main");
});

test("every route exposes exactly one h1", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
  }
});

test("current page is marked in the navigation", async ({ page }) => {
  await page.goto("/community");
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText("Community");
});

test("no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of ROUTES) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${route} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});
```

- [ ] **Step 4: Run it**

Run: `npx playwright test tests/e2e/shell.spec.ts`
Expected: FAIL on the routes that do not exist yet. Create minimal placeholder pages for `/community`, `/research`, `/products`, `/contribute`, each rendering `BaseLayout` with a single `h1`, then re-run.
Expected after that: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add base layout, navigation, and footer"
```

---

### Task 5: The rail and post cards

This is the signature device. Build it once; four pages consume it.

**Files:**
- Create: `src/components/Rail.astro`, `src/components/RailItem.astro`, `src/components/PostCard.astro`
- Test: `tests/e2e/rail.spec.ts`

**Interfaces:**
- Consumes: `tierClass`, `tickClass` from `src/lib/tiers.ts`; `formatDate` from `src/lib/dates.ts`; `withYearMarkers` from `src/lib/posts.ts`.
- Produces: `Rail` with a default slot. `RailItem` accepting `tier: Tier | "event"` and `yearMarker: string | null`. `PostCard` accepting `href: string`, `title: string`, `date: Date`, `summary: string`, `tier: Tier`.

- [ ] **Step 1: Write `src/components/Rail.astro`**

```astro
---
---
<ol class="rail"><slot /></ol>

<style>
  .rail {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
  }
  /* The constant-interval rule. Inset to sit 40px left of the card edge. */
  .rail::before {
    content: "";
    position: absolute;
    left: 16px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--border-soft);
  }
</style>
```

- [ ] **Step 2: Write `src/components/RailItem.astro`**

Renders `<li class="rail-item">` containing the year marker (when present), the tick, and the slot. The tick is absolutely positioned at `left: 16px` with `transform: translateX(-50%)`, aligned to the first text baseline via `top`. Tick styles:

```css
.tick { position: absolute; left: 16px; transform: translateX(-50%); top: 11px; }
.tick--major {
  width: var(--tick-size); height: var(--tick-size);
  background: var(--foreground);
  outline: 2px solid var(--background);
}
.tick--progress {
  width: var(--tick-size); height: var(--tick-size);
  border: 1px solid var(--foreground); background: var(--background);
  outline: 2px solid var(--background);
}
.tick--standard {
  width: var(--tick-size); height: 1px;
  background: var(--border-soft-hover);
}
.tick--event {
  width: var(--tick-size); height: var(--tick-size);
  border: 1px solid var(--border-soft-hover); background: var(--background);
  outline: 2px solid var(--background);
}
.year {
  position: absolute; left: 16px; transform: translateX(-50%);
  background: var(--background); padding: 4px 0;
  font-size: 12px; color: var(--muted-foreground);
  writing-mode: horizontal-tb;
}
```

The year marker sits above its entry and paints `--background` so the rule appears to pass behind it. Below 640px, shift the rail rule and ticks to `left: 4px` and reduce the card inset so the layout still fits 360px.

- [ ] **Step 3: Write `src/components/PostCard.astro`**

An `<a>` carrying `tierClass(tier)`. Inside: a row with `display: flex; align-items: baseline; justify-content: space-between; gap: 8px` holding the title (`font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`) and the date (`font-size: 12px; color: var(--muted-foreground); flex-shrink: 0; white-space: nowrap`). Beneath, the summary. Tier styles:

```css
.card { display: flex; flex-direction: column; padding: 8px 12px; margin-left: var(--rail-offset); text-decoration: none; transition: box-shadow var(--transition), background-color var(--transition), border-color var(--transition); }
.card--major { gap: 8px; background: var(--card); border: 1px solid var(--foreground); box-shadow: 3px 3px 0 var(--foreground); }
.card--major:hover { box-shadow: 5px 5px 0 var(--foreground); }
.card--major .summary { font-size: 14px; }
.card--progress { gap: 8px; background: var(--card-soft); border: 1px solid var(--border-soft); }
.card--progress:hover { background: var(--card); border-color: var(--border-soft-hover); box-shadow: 3px 3px 0 var(--border-soft-hover); }
.card--standard { gap: 4px; border: 1px solid transparent; }
.card--standard:hover { background: var(--background-hover); }
.summary { font-size: 12px; color: var(--muted-foreground); }
```

`.card--standard` carries a transparent 1px border so all three tiers occupy identical box dimensions and do not shift the rail alignment.

- [ ] **Step 4: Write the failing test**

```ts
// tests/e2e/rail.spec.ts
import { test, expect } from "@playwright/test";

test("each tier renders its own tick and card treatment", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".card--major").first()).toBeVisible();
  await expect(page.locator(".card--progress").first()).toBeVisible();
  await expect(page.locator(".card--standard").first()).toBeVisible();
  await expect(page.locator(".tick--major").first()).toBeVisible();
  await expect(page.locator(".tick--progress").first()).toBeVisible();
  await expect(page.locator(".tick--standard").first()).toBeVisible();
});

test("major card raises its shadow on hover", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".card--major").first();
  const before = await card.evaluate((el) => getComputedStyle(el).boxShadow);
  await card.hover();
  await page.waitForTimeout(200);
  const after = await card.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(after).not.toBe(before);
});

test("all three tiers share identical box width", async ({ page }) => {
  await page.goto("/");
  const widths = await page.evaluate(() =>
    ["major", "progress", "standard"].map((t) => {
      const el = document.querySelector(`.card--${t}`);
      return el ? Math.round(el.getBoundingClientRect().width) : -1;
    }),
  );
  expect(new Set(widths).size).toBe(1);
});

test("year markers appear once per year", async ({ page }) => {
  await page.goto("/");
  const years = await page.locator(".year").allTextContents();
  expect(new Set(years).size).toBe(years.length);
});
```

- [ ] **Step 5: Run it**

Run: `npx playwright test tests/e2e/rail.spec.ts`
Expected: FAIL until Task 7 populates the homepage. Note this and proceed; Task 7 re-runs it.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add constant-interval rail and three-tier post cards"
```

---

### Task 6: Disclosure component

**Files:**
- Create: `src/components/Disclosure.astro`
- Test: `tests/e2e/disclosure.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `Disclosure` accepting `summary: string`, `meta?: string`, `open?: boolean`, and a default slot.

- [ ] **Step 1: Write the component**

Built on `<details>` and `<summary>`. The summary row shows the label at left, optional meta at right, and a `+` that becomes `−` when open via `details[open] .marker`. Remove the native triangle with `summary::-webkit-details-marker { display: none }` and `summary { list-style: none }`. Give `summary` `cursor: pointer` and rely on its native focus behavior. Do not add `tabindex` or click handlers; `<summary>` is already keyboard-operable.

- [ ] **Step 2: Write the failing test**

```ts
// tests/e2e/disclosure.spec.ts
import { test, expect } from "@playwright/test";

test("disclosure opens with the keyboard", async ({ page }) => {
  await page.goto("/community");
  const first = page.locator("details").first();
  await expect(first).not.toHaveAttribute("open", "");
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("open", "");
});

test("disclosure content is present in the DOM before opening", async ({ page }) => {
  await page.goto("/community");
  const body = page.locator("details .disclosure-body").first();
  await expect(body).toBeAttached();
});
```

The second test matters: content inside a closed `<details>` stays in the DOM, so search engines index it and Ctrl+F finds it. A JavaScript accordion that unmounts its content would fail this.

- [ ] **Step 3: Run it after Task 8 lands, then commit**

```bash
git add -A
git commit -m "Add native details-based disclosure component"
```

---

### Task 7: Homepage

**Files:**
- Create: `src/components/BoardCard.astro`
- Modify: `src/pages/index.astro`
- Create: `src/content/board/*.md` (four), `src/content/blog/*.md` (eight)
- Create: `public/images/board/*.svg` (four placeholders)
- Test: re-run `tests/e2e/rail.spec.ts`, add `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `Rail`, `RailItem`, `PostCard`, `publishedPosts`, `sortByDateDesc`, `withYearMarkers`, `site`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the eight placeholder blog posts**

Filenames are the URL slugs. Required coverage, exactly as specified:

| File | tier | topics |
|---|---|---|
| `2026-08-12-summer-camp-program-report.md` | major | `[community]` |
| `2026-06-04-chassis-v2-release.md` | major | `[product]` |
| `2026-05-19-vision-pipeline-progress.md` | progress | `[research, product]` |
| `2026-04-02-regional-outreach-progress.md` | progress | `[community]` |
| `2026-02-27-odometry-study-results.md` | progress | `[research]` |
| `2025-11-15-mentor-network-expansion.md` | standard | `[community]` |
| `2025-09-08-scoring-toolkit-notes.md` | standard | `[product]` |
| `2025-07-21-organizational-update.md` | standard | `[]` |

The multi-topic entry exercises the routing property, the empty-topic entry proves homepage-only posts work, and the 2025 entries force at least one year boundary on the rail. Bodies are three to five paragraphs of plausible, professional prose. No exclamation marks, no marketing language.

- [ ] **Step 2: Write the four board entries and placeholder headshots**

`moon-liu.md`, `jay-wang.md`, `owen-fong.md`, `stuart-li.md` with `order` 1 through 4. Each `photo` points at `/images/board/<slug>.svg`. Generate each placeholder as a 400x400 SVG filled `--card` with a 1px `--border-soft` border and the person's initials centered in the display serif, so the grid has correct proportions before real photographs arrive. `alt` reads `Headshot of <Name>`.

- [ ] **Step 3: Write `src/components/BoardCard.astro`**

Props `name`, `role`, `photo`, `alt`, and a slot for the description. Image is square, `width="400" height="400"`, `loading="lazy"`, `decoding="async"`, `aspect-ratio: 1`, `object-fit: cover`, `width: 100%`. Explicit dimensions plus `aspect-ratio` prevent layout shift when real photographs replace the placeholders at a different intrinsic size.

- [ ] **Step 4: Write the homepage**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../layouts/BaseLayout.astro";
import BoardCard from "../components/BoardCard.astro";
import Rail from "../components/Rail.astro";
import RailItem from "../components/RailItem.astro";
import PostCard from "../components/PostCard.astro";
import { site } from "../data/site";
import { publishedPosts, sortByDateDesc, withYearMarkers } from "../lib/posts";

const board = (await getCollection("board")).sort(
  (a, b) => a.data.order - b.data.order,
);
const posts = withYearMarkers(
  sortByDateDesc(publishedPosts(await getCollection("blog"))),
);
---
<BaseLayout title={site.name} description={site.description}>
  <h1 class="sr-only">{site.name}</h1>
  <p class="intro">{site.description}</p>

  <h2>Board</h2>
  <ul class="board-grid">
    {board.map((m) => (
      <li>
        <BoardCard {...m.data}>
          <Fragment set:html={m.rendered?.html} />
        </BoardCard>
      </li>
    ))}
  </ul>

  <h2>Updates</h2>
  <Rail>
    {posts.map(({ item, yearMarker }) => (
      <RailItem tier={item.data.tier} yearMarker={yearMarker}>
        <PostCard
          href={`/blog/${item.id}`}
          title={item.data.title}
          date={item.data.date}
          summary={item.data.summary}
          tier={item.data.tier}
        />
      </RailItem>
    ))}
  </Rail>
</BaseLayout>
```

If `m.rendered?.html` is unavailable in the installed Astro version, call `const { Content } = await render(m)` per entry using `import { render } from "astro:content"` and render `<Content />` instead. Verify which API the installed version exposes rather than assuming.

Board grid: `repeat(4, 1fr)` above 1024px, `repeat(2, 1fr)` above 640px, single column below.

- [ ] **Step 5: Write `tests/e2e/home.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("official description appears verbatim", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".intro")).toHaveText(
    "Isentropic Robotics fosters STEM education through support for competitive robotics and community events for aspiring engineering students.",
  );
});

test("all four board members appear in order", async ({ page }) => {
  await page.goto("/");
  const names = await page.locator(".board-grid .board-name").allTextContents();
  expect(names).toEqual(["Moon Liu", "Jay Wang", "Owen Fong", "Stuart Li"]);
});

test("every board headshot carries alt text", async ({ page }) => {
  await page.goto("/");
  const imgs = page.locator(".board-grid img");
  for (let i = 0; i < (await imgs.count()); i++) {
    await expect(imgs.nth(i)).toHaveAttribute("alt", /\S/);
  }
});

test("homepage lists every published post", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".rail .card")).toHaveCount(8);
});
```

- [ ] **Step 6: Run the homepage and rail suites**

Run: `npx playwright test tests/e2e/home.spec.ts tests/e2e/rail.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add homepage with board grid and full update rail"
```

---

### Task 8: Forms infrastructure

Built before any page that uses a form, so pages consume a finished primitive.

**Files:**
- Create: `src/components/forms/Field.astro`, `src/components/forms/NetlifyForm.astro`, `src/scripts/forms.ts`, `src/pages/thanks.astro`, `public/__forms.html`
- Test: `tests/e2e/forms.spec.ts`

**Interfaces:**
- Consumes: `site.formNames`.
- Produces: `NetlifyForm` accepting `name: string`, `action?: string`, `multipart?: boolean`, and a slot. `Field` accepting `label: string`, `name: string`, `type?: string`, `required?: boolean`, `as?: "input" | "textarea" | "select"`, `options?: string[]`, `help?: string`.

- [ ] **Step 1: Write `NetlifyForm.astro`**

Emits:

```html
<form
  name={name}
  method="POST"
  action={action ?? "/thanks"}
  data-netlify="true"
  netlify-honeypot="bot-field"
  enctype={multipart ? "multipart/form-data" : undefined}
>
  <input type="hidden" name="form-name" value={name} />
  <p class="hp"><label>Leave this field empty<input name="bot-field" /></label></p>
  <slot />
  <div class="form-status" role="status" aria-live="polite"></div>
  <button type="submit">Send</button>
</form>
```

`.hp { position: absolute; left: -9999px; }`. The honeypot must be visually hidden but reachable by bots, so it cannot use `display: none`.

- [ ] **Step 2: Write `Field.astro`**

Renders a `<label>` bound by `for`/`id`, the control, an optional help paragraph, and an empty error region with `id="<name>-error"` referenced by the control's `aria-describedby`. Controls carry native constraints: `required`, `type="email"`, `maxlength`. Never remove focus outlines.

- [ ] **Step 3: Write `src/scripts/forms.ts`**

```ts
export function enhanceForms(): void {
  const forms = document.querySelectorAll<HTMLFormElement>("form[data-netlify]");
  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      // Let the browser show its own messages and fall back to a real POST.
      if (!form.checkValidity()) return;
      event.preventDefault();

      const status = form.querySelector<HTMLElement>(".form-status");
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (button) button.disabled = true;
      if (status) status.textContent = "Sending…";

      try {
        const response = await fetch(form.getAttribute("action") ?? "/", {
          method: "POST",
          body: new FormData(form),
        });
        if (!response.ok) throw new Error(`Server responded ${response.status}`);
        form.reset();
        if (status) status.textContent = "Received. We will respond by email.";
      } catch (error) {
        if (status) {
          status.textContent =
            "The submission did not go through. Check your connection and send again.";
        }
        if (button) button.disabled = false;
        return;
      }
      if (button) button.disabled = false;
    });
  });
}
```

`FormData` produces `multipart/form-data`, which Netlify accepts for every form including the one with a file upload, so all three share one code path. Called from `BaseLayout` inside a module script.

- [ ] **Step 4: Write `public/__forms.html`**

A plain HTML file, never linked, declaring all three forms with every field name. Netlify parses deployed HTML at build time to register forms; this stub guarantees registration even for the manuscript form, whose instances are generated per research entry.

```html
<!doctype html>
<html><head><title>Form detection</title></head><body>
<form name="sponsor-contact" data-netlify="true" netlify-honeypot="bot-field" hidden>
  <input name="bot-field" /><input name="organization" /><input name="contact-name" />
  <input type="email" name="email" /><input name="sponsorship-level" /><textarea name="message"></textarea>
</form>
<form name="manuscript-request" data-netlify="true" netlify-honeypot="bot-field" hidden>
  <input name="bot-field" /><input name="manuscript" /><input name="name" />
  <input type="email" name="email" /><input name="affiliation" /><textarea name="intended-use"></textarea>
</form>
<form name="application" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data" hidden>
  <input name="bot-field" /><input name="name" /><input type="email" name="email" />
  <input name="role" /><input name="links" /><input type="file" name="resume" /><textarea name="message"></textarea>
</form>
</body></html>
```

Field names here must match the real forms exactly. A mismatch means Netlify silently drops that field from submissions.

- [ ] **Step 5: Write `src/pages/thanks.astro`**

Confirms receipt, states that a reply will come by email, and links back to the homepage. Single `h1`.

- [ ] **Step 6: Write the failing test**

```ts
// tests/e2e/forms.spec.ts
import { test, expect } from "@playwright/test";

const FORMS = [
  { page: "/contribute", name: "sponsor-contact" },
  { page: "/research", name: "manuscript-request" },
  { page: "/contribute", name: "application" },
];

for (const { page: path, name } of FORMS) {
  test(`${name} carries the attributes Netlify requires`, async ({ page }) => {
    await page.goto(path);
    const form = page.locator(`form[name="${name}"]`).first();
    await expect(form).toHaveAttribute("data-netlify", "true");
    await expect(form).toHaveAttribute("method", /post/i);
    await expect(form).toHaveAttribute("netlify-honeypot", "bot-field");
    await expect(
      form.locator('input[name="form-name"]'),
    ).toHaveValue(name);
  });
}

test("application form accepts a file upload", async ({ page }) => {
  await page.goto("/contribute");
  const form = page.locator('form[name="application"]');
  await expect(form).toHaveAttribute("enctype", "multipart/form-data");
  await expect(form.locator('input[type="file"]')).toHaveCount(1);
});

test("invalid email blocks submission", async ({ page }) => {
  await page.goto("/contribute");
  const form = page.locator('form[name="sponsor-contact"]');
  await form.locator('input[type="email"]').fill("not-an-email");
  await form.locator('button[type="submit"]').click();
  const valid = await form
    .locator('input[type="email"]')
    .evaluate((el: HTMLInputElement) => el.checkValidity());
  expect(valid).toBe(false);
  await expect(page).toHaveURL(/contribute/);
});

test("successful submission reports inline without navigating", async ({ page }) => {
  await page.route("**/thanks", (route) =>
    route.fulfill({ status: 200, body: "ok" }),
  );
  await page.goto("/contribute");
  const form = page.locator('form[name="sponsor-contact"]');
  await form.locator('input[name="organization"]').fill("Example School");
  await form.locator('input[name="contact-name"]').fill("A. Person");
  await form.locator('input[type="email"]').fill("person@example.org");
  await form.locator('textarea[name="message"]').fill("Interested in sponsoring.");
  await form.locator('button[type="submit"]').click();
  await expect(form.locator(".form-status")).toContainText("Received");
  await expect(page).toHaveURL(/contribute/);
});

test("every manuscript form identifies its own entry", async ({ page }) => {
  await page.goto("/research");
  const hidden = page.locator('form[name="manuscript-request"] input[name="manuscript"]');
  const values = await hidden.evaluateAll((els) =>
    els.map((e) => (e as HTMLInputElement).value),
  );
  expect(values.length).toBeGreaterThan(0);
  expect(values.every((v) => v.trim().length > 0)).toBe(true);
  expect(new Set(values).size).toBe(values.length);
});

test("detection stub declares every form", async ({ page }) => {
  await page.goto("/__forms.html");
  for (const name of ["sponsor-contact", "manuscript-request", "application"]) {
    await expect(page.locator(`form[name="${name}"]`)).toHaveCount(1);
  }
});
```

- [ ] **Step 7: Run after Tasks 9 and 11 land**

These tests depend on the Research and Contribute pages. Run them at the end of Task 11.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add Netlify form primitives, enhancement script, and detection stub"
```

---

### Task 9: Community page

**Files:**
- Modify: `src/pages/community.astro`
- Create: `src/content/events/*.md` (four)
- Test: `tests/e2e/community.spec.ts`

**Interfaces:**
- Consumes: `Rail`, `RailItem`, `PostCard`, `Disclosure`, `filterByTopic`, `sortByDateDesc`, `publishedPosts`, `withYearMarkers`.

- [ ] **Step 1: Write four event entries**

Dated across 2025 and 2026 so the timeline shows a year boundary. Each carries `title`, `date`, `location`, `summary`, and a body covering attendance, partner organizations, and outcomes in professional prose.

- [ ] **Step 2: Build the page**

Section one: an intro paragraph, then `<Rail>` where each `RailItem` uses `tier="event"` and wraps a `Disclosure` whose summary is the event title with the date and location as meta. The disclosure body holds the rendered event Markdown.

Section two: heading "Community updates", then a second `Rail` of `PostCard`s from `filterByTopic(posts, "community")`.

Both rails call `withYearMarkers` on their own sorted list independently.

- [ ] **Step 3: Write the test**

```ts
// tests/e2e/community.spec.ts
import { test, expect } from "@playwright/test";

test("timeline lists every event", async ({ page }) => {
  await page.goto("/community");
  await expect(page.locator(".events details")).toHaveCount(4);
});

test("community updates exclude posts from other topics", async ({ page }) => {
  await page.goto("/community");
  const titles = await page.locator(".updates .card-title").allTextContents();
  expect(titles.length).toBe(3);
  expect(titles.join(" ")).not.toContain("Chassis");
});
```

Three community posts are expected: the summer camp report, the regional outreach update, and the mentor network expansion.

- [ ] **Step 4: Run both this and the disclosure suite**

Run: `npx playwright test tests/e2e/community.spec.ts tests/e2e/disclosure.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add community page with event timeline and filtered updates"
```

---

### Task 10: Research and Products pages

**Files:**
- Modify: `src/pages/research.astro`, `src/pages/products.astro`
- Create: `src/content/research/*.md` (two), `src/content/products/*.md` (two)
- Test: `tests/e2e/research.spec.ts`, `tests/e2e/products.spec.ts`

**Interfaces:**
- Consumes: `Disclosure`, `NetlifyForm`, `Field`, `Rail`, `RailItem`, `PostCard`, `filterByTopic`.

- [ ] **Step 1: Write the research entries**

Two entries. One sets `manuscriptAvailable: true`, the other `false`, so both branches render and are testable. Each carries a formal `abstract` and a plain-language `synopsis`, with the body covering methods, results, and references.

- [ ] **Step 2: Build the research page**

Each entry renders title, authors joined by commas, formatted date, and the abstract. A `Disclosure` expands to the synopsis, the rendered body, and, when `manuscriptAvailable` is true, a `NetlifyForm` named `site.formNames.manuscript` containing a hidden `manuscript` input set to the entry title plus fields for name, email, affiliation, and intended use. Then a "Research updates" rail filtered to `research`.

- [ ] **Step 3: Write the products entries and page**

One `hardware`, one `software`, each with at least one link. The page groups by `kind` with hardware first, renders each as a bordered box carrying title, status, and summary, with a `Disclosure` expanding to specifications and the link list. Then a "Product updates" rail filtered to `product`.

- [ ] **Step 4: Write the tests**

```ts
// tests/e2e/research.spec.ts
import { test, expect } from "@playwright/test";

test("manuscript form appears only where the manuscript is available", async ({ page }) => {
  await page.goto("/research");
  const entries = page.locator(".research-entry");
  await expect(entries).toHaveCount(2);
  await expect(page.locator('form[name="manuscript-request"]')).toHaveCount(1);
});

test("research updates include the multi-topic post", async ({ page }) => {
  await page.goto("/research");
  const titles = await page.locator(".updates .card-title").allTextContents();
  expect(titles.length).toBe(2);
  expect(titles.join(" ")).toContain("Vision");
});
```

```ts
// tests/e2e/products.spec.ts
import { test, expect } from "@playwright/test";

test("hardware is listed before software", async ({ page }) => {
  await page.goto("/products");
  const kinds = await page.locator(".product[data-kind]").evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-kind")),
  );
  expect(kinds).toEqual(["hardware", "software"]);
});

test("the multi-topic post appears here too", async ({ page }) => {
  await page.goto("/products");
  const titles = await page.locator(".updates .card-title").allTextContents();
  expect(titles.join(" ")).toContain("Vision");
});
```

The last assertion is the routing property under test: one file, tagged `[research, product]`, reaching two pages with no duplicated content.

- [ ] **Step 5: Run them**

Run: `npx playwright test tests/e2e/research.spec.ts tests/e2e/products.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add research and products pages with manuscript request form"
```

---

### Task 11: Contribute page

**Files:**
- Modify: `src/pages/contribute.astro`
- Create: `src/content/roles/*.md` (four), `public/files/isentropic-sponsor-packet.pdf`
- Test: `tests/e2e/contribute.spec.ts`, then the full `tests/e2e/forms.spec.ts`

**Interfaces:**
- Consumes: `NetlifyForm`, `Field`, `Disclosure`, `site`.

- [ ] **Step 1: Write four roles across at least two categories**

For example: two under "Education", two under "Engineering". Each carries `title`, `category`, `location`, `commitment`, `open: true`, and `order`.

- [ ] **Step 2: Create the sponsor packet placeholder**

Generate a real single-page PDF at `public/files/isentropic-sponsor-packet.pdf` stating that it is a placeholder to be replaced. It must be a valid PDF, not a renamed text file, so the download link genuinely works before real content arrives.

- [ ] **Step 3: Build the sponsors section**

An explanation of sponsorship, then the packet link stating format and size, for example "Sponsor packet (PDF, 48 KB)", then the sponsor contact form: organization, contact name, email, sponsorship level (a select), and message.

- [ ] **Step 4: Build the Join Us section**

Roles grouped by category, each category a `Disclosure` listing its open roles with location and commitment. Then the application form. Its role select is generated from open roles and always ends with the literal option `<insert-role-you-excel-at/>`, following the reference. The form is multipart and includes a file input for a resume.

Escape the angle brackets in the option label so it renders as text rather than being parsed as markup.

- [ ] **Step 5: Write the test**

```ts
// tests/e2e/contribute.spec.ts
import { test, expect } from "@playwright/test";

test("sponsor packet link resolves", async ({ page, request }) => {
  await page.goto("/contribute");
  const href = await page.locator("a.packet").getAttribute("href");
  expect(href).toBeTruthy();
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("pdf");
});

test("role select lists open roles plus the open-ended option", async ({ page }) => {
  await page.goto("/contribute");
  const options = await page
    .locator('form[name="application"] select[name="role"] option')
    .allTextContents();
  expect(options).toContain("<insert-role-you-excel-at/>");
  expect(options.length).toBeGreaterThan(4);
});

test("closed roles are not listed", async ({ page }) => {
  await page.goto("/contribute");
  await expect(page.locator(".role")).toHaveCount(4);
});
```

- [ ] **Step 6: Run the contribute and full form suites**

Run: `npx playwright test tests/e2e/contribute.spec.ts tests/e2e/forms.spec.ts`
Expected: PASS, including every test deferred from Task 8.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add contribute page with sponsor and application forms"
```

---

### Task 12: Article route and reading layer

**Files:**
- Create: `src/layouts/ArticleLayout.astro`, `src/pages/blog/[...slug].astro`, `src/styles/prose.css`
- Test: `tests/e2e/article.spec.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `formatDate`, `site`.
- Produces: routes at `/blog/<id>` for every non-draft blog entry.

- [ ] **Step 1: Write the dynamic route**

`getStaticPaths` returns one entry per non-draft post, keyed on the entry `id`. The page renders `ArticleLayout` with the title, date, and rendered content.

- [ ] **Step 2: Write `ArticleLayout.astro` and `prose.css`**

The display title uses `--font-display`, 60px above 768px and 40px below, `text-wrap: balance`, `line-height: 1.1`. Beneath it, a metadata block in the chrome layer showing "Published" with the formatted date and the contact email. The prose column caps at `--measure-prose`, uses `--font-body` at 18px/1.625, and styles headings, lists, blockquotes, inline code, code blocks, tables, figures with captions, and links with visible underlines. Tables and code blocks sit in `overflow-x: auto` containers so they scroll inside themselves rather than widening the page.

- [ ] **Step 3: Write the test**

```ts
// tests/e2e/article.spec.ts
import { test, expect } from "@playwright/test";

test("article renders in the reading layer", async ({ page }) => {
  await page.goto("/blog/2026-08-12-summer-camp-program-report");
  const h1 = page.locator("h1");
  await expect(h1).toBeVisible();
  const family = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toContain("Garamond");
  const body = await page
    .locator(".prose p")
    .first()
    .evaluate((el) => getComputedStyle(el).fontSize);
  expect(body).toBe("18px");
});

test("draft posts do not get a route", async ({ page }) => {
  const response = await page.goto("/blog/_TEMPLATE");
  expect(response?.status()).toBe(404);
});

test("prose column does not exceed its measure", async ({ page }) => {
  await page.goto("/blog/2026-08-12-summer-camp-program-report");
  const width = await page
    .locator(".prose")
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(768);
});
```

- [ ] **Step 4: Run it**

Run: `npx playwright test tests/e2e/article.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add article route with serif reading layer"
```

---

### Task 13: Feed, sitemap, and metadata

**Files:**
- Create: `src/pages/rss.xml.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/e2e/meta.spec.ts`

**Interfaces:**
- Consumes: `publishedPosts`, `sortByDateDesc`, `site`.

- [ ] **Step 1: Install and wire the feed**

```bash
npm install @astrojs/rss
```

`src/pages/rss.xml.ts` exports a `GET` returning `rss({ title, description, site, items })` where items map each non-draft post to `{ title, pubDate, description, link }`.

- [ ] **Step 2: Extend `BaseLayout`**

Per-page `<title>` and `<meta name="description">` from props, Open Graph `og:title`, `og:description`, `og:type`, `og:url`, a canonical link, and `<link rel="alternate" type="application/rss+xml" href="/rss.xml">`.

- [ ] **Step 3: Write the test**

```ts
// tests/e2e/meta.spec.ts
import { test, expect } from "@playwright/test";

test("feed lists published posts and excludes drafts", async ({ request }) => {
  const res = await request.get("/rss.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect((xml.match(/<item>/g) ?? []).length).toBe(8);
  expect(xml).not.toContain("TEMPLATE");
});

test("sitemap is generated", async ({ request }) => {
  const res = await request.get("/sitemap-index.xml");
  expect(res.status()).toBe(200);
});

test("each page carries a distinct title and description", async ({ page }) => {
  const seen = new Set<string>();
  for (const route of ["/", "/community", "/research", "/products", "/contribute"]) {
    await page.goto(route);
    const title = await page.title();
    const desc = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(title.trim().length).toBeGreaterThan(0);
    expect(desc?.trim().length).toBeGreaterThan(0);
    expect(seen.has(title)).toBe(false);
    seen.add(title);
  }
});
```

- [ ] **Step 4: Run it**

Run: `npx playwright test tests/e2e/meta.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add RSS feed, sitemap, and per-page metadata"
```

---

### Task 14: Accessibility sweep and handover documentation

**Files:**
- Create: `tests/e2e/a11y.spec.ts`, `CONTENT-GUIDE.md`, `README.md`
- Modify: whatever the audit finds

**Interfaces:**
- Consumes: everything.

- [ ] **Step 1: Write the accessibility test**

```ts
// tests/e2e/a11y.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/", "/community", "/research", "/products", "/contribute",
  "/thanks", "/blog/2026-08-12-summer-camp-program-report",
];

for (const route of ROUTES) {
  test(`${route} has no accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const width of [360, 768, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ROUTES) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}
```

- [ ] **Step 2: Run it and fix every violation**

Run: `npx playwright test tests/e2e/a11y.spec.ts`
Fix real violations in the source. Do not suppress rules to make the suite pass. If a violation is a genuine false positive, disable that single rule for that single selector with a comment explaining why.

- [ ] **Step 3: Write `CONTENT-GUIDE.md`**

Written for someone who has never used a terminal. One numbered procedure per task, each naming the exact folder, the template to copy, and which fields to change. Cover: add a blog post, choose the right `tier`, choose `topics`, add a board member, replace a headshot, add an event, add a research entry, add a product, open and close a role, replace the sponsor packet, and where submissions arrive in the Netlify dashboard. Include the tier table verbatim from this plan so the author never has to guess which style a post gets.

- [ ] **Step 4: Write `README.md`**

Local development (`npm install`, `npm run dev`), build (`npm run build`), tests (`npm run test:unit`, `npm run test:e2e`), and Netlify settings: build command `npm run build`, publish directory `dist`. Note that form submissions appear under Forms in the Netlify site dashboard and that notification emails are configured there.

- [ ] **Step 5: Add npm scripts and run everything**

```bash
npm run build
npx vitest run
npx playwright test
```

Expected: build succeeds, all unit tests pass, all end-to-end tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add accessibility suite and maintainer documentation"
```

---

## Self-Review

**Spec coverage.** Section 3 tokens map to Task 1. Section 3.2.1 wordmark maps to Task 1, which resolves the glyph question before anything depends on it. Section 4 rail maps to Task 5. Section 5 card tiers map to Task 5. Section 6 collections map to Task 2, logic to Task 3. Sections 7.1 through 7.7 map to Tasks 7, 9, 10, 11, 12, and 8 respectively. Section 8 components are distributed across Tasks 4, 5, 6, and 8. Section 9 forms map to Task 8, exercised in Tasks 10 and 11. Section 10 quality floor maps to Task 14, with the 360px check also enforced in Task 4. Section 11 handover maps to Task 14. Section 12 deliverables are all claimed by a task.

**Gap found and closed.** The spec's `/rss.xml` and `/sitemap.xml` were listed under deliverables but had no owning task. Task 13 was added.

**Type consistency.** `Tier` and `Topic` are defined once in `src/content.config.ts` and imported everywhere. `tierClass` and `tickClass` are used only in Tasks 5. `withYearMarkers` returns `{ item, yearMarker }` and is destructured with those exact names in Tasks 7 and 9. `site.formNames` keys `sponsor`, `manuscript`, `application` map to the string values `sponsor-contact`, `manuscript-request`, `application`, which are the names asserted in the Task 8 tests and declared in `public/__forms.html`.

**Known cross-task dependency.** The Task 5 rail suite and the Task 6 disclosure suite cannot pass until content exists. This is stated in both tasks with the point at which they are re-run, rather than left to be discovered.
