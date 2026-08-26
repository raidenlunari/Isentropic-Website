import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Helpers for deriving a test's expected counts from the content files on
// disk instead of pinning a literal.
//
// The literals were a real maintenance trap: `.research-entry` was pinned
// to 2 and the manuscript form to 1, so adding a research entry or marking
// a second manuscript available - the two things CONTENT-GUIDE.md Task 6
// exists to tell a maintainer to do - turned the suite red for a correct
// content change. A board member who cannot read the failure has no way to
// tell "I broke the site" from "the test counted wrong". Every count that
// tracks content now comes from here.
//
// These helpers deliberately read the raw Markdown rather than importing
// the shaping helpers from src/lib/posts.ts. A test that derived its
// expectation from the same code that produced the page would agree with
// the page even when both are wrong; reading frontmatter directly keeps
// the expectation independent of the rendering path.
//
// This file is not named *.spec.ts, so Playwright does not collect it as a
// test file.

const CONTENT_ROOT = fileURLToPath(
  new URL("../../src/content", import.meta.url),
);

export interface ContentEntry {
  /** File name without the .md extension - the collection id Astro uses. */
  slug: string;
  /** Raw text between the two `---` fences. */
  frontmatter: string;
}

/**
 * Every publishable entry in a collection, sorted by slug. Files starting
 * with an underscore are excluded, matching the `"**\/[^_]*.md"` glob in
 * content.config.ts that keeps `_TEMPLATE.md` off the site.
 */
export function entries(collection: string): ContentEntry[] {
  const dir = path.join(CONTENT_ROOT, collection);
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .sort()
    .map((name) => {
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      const fenced = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
      return {
        slug: name.replace(/\.md$/, ""),
        frontmatter: fenced ? fenced[1] : "",
      };
    });
}

/** A single top-level frontmatter value, verbatim, or null if absent. */
export function field(entry: ContentEntry, name: string): string | null {
  const match = new RegExp(`^${name}:[ \\t]*(.*)$`, "m").exec(entry.frontmatter);
  return match ? match[1].trim() : null;
}

/** A frontmatter string value with its surrounding quotes removed. */
export function text(entry: ContentEntry, name: string): string {
  return (field(entry, name) ?? "").replace(/^["']|["']$/g, "");
}

/** True when a boolean frontmatter field is set to `true`. */
export function isTrue(entry: ContentEntry, name: string): boolean {
  return field(entry, name) === "true";
}

/** A frontmatter list written inline, for example `topics: [a, b]`. */
export function list(entry: ContentEntry, name: string): string[] {
  const raw = field(entry, name);
  if (raw === null) return [];
  return raw
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter((item) => item.length > 0);
}

/** Blog entries without `draft: true` - the posts that reach the site. */
export function publishedPosts(): ContentEntry[] {
  return entries("blog").filter((entry) => !isTrue(entry, "draft"));
}

/** Blog entries with `draft: true` - the posts that must not reach it. */
export function draftPosts(): ContentEntry[] {
  return entries("blog").filter((entry) => isTrue(entry, "draft"));
}

/** Published blog entries carrying a topic, for the per-topic rails. */
export function publishedPostsWithTopic(topic: string): ContentEntry[] {
  return publishedPosts().filter((entry) => list(entry, "topics").includes(topic));
}
