import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";
import type { VFile } from "vfile";

// Research and product entries (research.astro/products.astro) render each
// entry's title as an <h3> - nested under the page's own "Research entries"
// / "Product entries" <h2> - and then splice in that entry's Markdown body
// via <Content />. The body's own "## Motivation" / "## Specifications"
// headings compile to <h2> by default, which would outrank the <h3> entry
// title containing them: a screen reader user navigating by heading would
// perceive "Motivation" as a sibling of "Research entries", not as a child
// of the specific entry it belongs to.
//
// This shifts every heading in a research/product entry's body down two
// levels (h2 -> h4, h3 -> h5, ...) so it nests correctly beneath that
// entry's h3 title. It must not touch anything else: blog articles nest
// correctly already (ArticleLayout puts a real <h1> above naturally-authored
// ##/### bodies), and a global shift would break that. Scoping is by source
// file path, which Astro's Markdown pipeline provides on the vfile.
const SHIFTED_DIRS = ["src/content/research/", "src/content/products/"];

export function rehypeNestEntryHeadings() {
  return (tree: Root, file: VFile) => {
    const path = typeof file.path === "string" ? file.path.split("\\").join("/") : "";
    const inShiftedDir = SHIFTED_DIRS.some((dir) => path.includes(dir));
    if (!inShiftedDir) return;

    visit(tree, "element", (node: Element) => {
      const match = /^h([1-6])$/.exec(node.tagName);
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
