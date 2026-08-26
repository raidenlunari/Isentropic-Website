import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";
import type { VFile } from "vfile";

// Several pages splice many entries' Markdown bodies into one page. That
// creates two problems a single-entry-per-page layout never has: heading
// levels that outrank the entry title containing them, and heading `id`s
// that collide between entries. The two plugins below fix one each. They
// are scoped by source file path, which Astro's Markdown pipeline provides
// on the vfile.

// Research entries (research.astro), product entries (products.astro), and
// volunteer roles (contribute.astro) each render their entry title as an
// <h3> - nested under that page's own <h2> section heading - and then
// splice in the entry's Markdown body via <Content />. The body's own
// "## Motivation" / "## Specifications" / "## Responsibilities" headings
// compile to <h2> by default, which would outrank the <h3> entry title
// containing them: a screen reader user navigating by heading would
// perceive "Motivation" as a sibling of "Research entries", not as a child
// of the specific entry it belongs to.
//
// This shifts every heading in such a body down two levels (h2 -> h4,
// h3 -> h5, ...) so it nests correctly beneath that entry's h3 title. It
// must not touch anything else: blog articles nest correctly already
// (ArticleLayout puts a real <h1> above naturally-authored ##/### bodies),
// and a global shift would break that.
//
// Community events are deliberately absent from this list. Their bodies
// render inside a Disclosure whose summary is a <span>, not a heading, so
// there is no ancestor heading for a shifted body heading to nest under
// and no correct shift amount to pick. CONTENT-GUIDE.md Task 11 instead
// tells event authors to use bold labels and lists rather than "##"
// headings, and tests/e2e/a11y.spec.ts asserts that events carry no
// headings at all, so that rule fails loudly if it is ever broken.
const SHIFTED_DIRS = [
  "src/content/research/",
  "src/content/products/",
  "src/content/roles/",
];

// Astro assigns each heading an `id` slugged from its own text, deduped
// only within the single Markdown file it came from. That is enough when
// one file owns a page, but every collection below renders many entries
// onto one page, so two entries that both write "## Results" ship two
// elements with id="results". Duplicate ids are invalid HTML and break
// fragment links and any id-based accessibility association on the page.
//
// Prefixing each id with the entry's own file slug makes them unique
// per page without changing anything an author writes. Events and board
// members are included even though their bodies are not level-shifted:
// they are rendered many-to-a-page just the same, so they carry the same
// collision risk. Blog posts are excluded - one post owns its whole page,
// so its ids cannot collide, and leaving them alone keeps article anchor
// links short and readable.
const NAMESPACED_DIRS = [
  ...SHIFTED_DIRS,
  "src/content/events/",
  "src/content/board/",
];

const HEADING = /^h([1-6])$/;

function entrySlug(file: VFile, dirs: readonly string[]): string | null {
  const path =
    typeof file.path === "string" ? file.path.split("\\").join("/") : "";
  if (!dirs.some((dir) => path.includes(dir))) return null;
  const base = path.slice(path.lastIndexOf("/") + 1);
  const slug = base.replace(/\.[^.]+$/, "");
  return slug.length > 0 ? slug : null;
}

export function rehypeNestEntryHeadings() {
  return (tree: Root, file: VFile) => {
    if (entrySlug(file, SHIFTED_DIRS) === null) return;

    visit(tree, "element", (node: Element) => {
      const match = HEADING.exec(node.tagName);
      if (!match) return;
      const level = Number(match[1]);
      // Clamp at h6: HTML has no deeper heading level. Entry bodies today
      // only ever author "##", so this never actually engages, but a future
      // author adding a deeper heading should get a valid (if flattened)
      // heading rather than an invalid tag.
      const shifted = Math.min(level + 2, 6);
      node.tagName = `h${shifted}`;
    });
  };
}

// Must run *after* `rehypeHeadingIds`, which is why astro.config.mjs lists
// that plugin explicitly rather than relying on Astro to append it: this
// plugin rewrites ids that already exist. Astro's own later pass leaves a
// heading that already has a string `id` untouched, so the namespaced id
// is what ships and what `getHeadings()` reports.
export function rehypeNamespaceEntryHeadingIds() {
  return (tree: Root, file: VFile) => {
    const slug = entrySlug(file, NAMESPACED_DIRS);
    if (slug === null) return;

    visit(tree, "element", (node: Element) => {
      if (!HEADING.test(node.tagName)) return;
      const id = node.properties?.id;
      if (typeof id !== "string" || id.length === 0) return;
      node.properties.id = `${slug}-${id}`;
    });
  };
}
