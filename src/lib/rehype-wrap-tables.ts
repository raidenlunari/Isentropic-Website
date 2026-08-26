import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

// Astro's Markdown pipeline emits a bare <table> for every Markdown table.
// Wrapping the *table itself* in overflow-x: auto (as prose.css originally
// did, via `display: block` on the table) strips its computed display away
// from `table`, which makes browsers drop the implicit table/row/cell
// accessibility roles - a real regression for screen reader users, who
// lose row/column navigation and header association entirely.
//
// The fix is a small rehype plugin: wrap every <table> in a
// <div class="table-scroll"> so the *wrapper* handles the horizontal
// scrolling and the table itself keeps `display: table` (and therefore its
// accessibility semantics) untouched.
export function rehypeWrapTables() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || parent === undefined || index === undefined) return;

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-scroll"] },
        children: [node],
      };

      parent.children[index] = wrapper;
    });
  };
}
