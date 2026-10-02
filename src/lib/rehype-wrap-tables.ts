import { SKIP, visit } from "unist-util-visit";
import type { Element, ElementContent, Root, RootContent } from "hast";

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
//
// Captions. GFM has no caption syntax, but a research entry can carry five
// tables on one page, and five scrollable regions all named "Scrollable
// table" are indistinguishable in a screen reader's landmark list. So the
// plugin adopts a convention: a paragraph immediately before a table whose
// text begins "Table N." (or "Table N:") is the table's caption. It is
// moved into a real <caption> element inside the table, and the wrapper's
// accessible name becomes that caption's text. A table with no such
// paragraph is named by its position on the page ("Scrollable table 2"),
// which is at least distinct. CONTENT-GUIDE.md Task 11 documents the
// convention for authors.

const CAPTION = /^\s*Table\s+\d+\s*[.:]/;

function textOf(node: RootContent | ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textOf).join("");
  return "";
}

function isBlankText(node: RootContent | ElementContent | undefined): boolean {
  return node !== undefined && node.type === "text" && node.value.trim() === "";
}

export function rehypeWrapTables() {
  return (tree: Root) => {
    // Per document, so numbering restarts for every Markdown file. On the
    // pages that splice many entries together the numbers can repeat
    // across entries; the caption convention is what tells those apart.
    let count = 0;

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || parent === undefined || index === undefined) return;
      count += 1;

      // The nearest preceding sibling that is not whitespace between
      // blocks, which is where a Markdown paragraph lands relative to the
      // table that follows it.
      let prevIndex = index - 1;
      while (prevIndex >= 0 && isBlankText(parent.children[prevIndex])) prevIndex -= 1;
      const prev = prevIndex >= 0 ? parent.children[prevIndex] : undefined;

      let label = `Scrollable table ${count}`;
      let tableIndex = index;
      if (prev !== undefined && prev.type === "element" && prev.tagName === "p" && CAPTION.test(textOf(prev))) {
        const caption: Element = {
          type: "element",
          tagName: "caption",
          properties: {},
          children: prev.children,
        };
        node.children.unshift(caption);
        label = textOf(prev).replace(/\s+/g, " ").trim();
        // Remove the paragraph (and the whitespace between it and the
        // table); the table shifts up to where the paragraph was.
        parent.children.splice(prevIndex, index - prevIndex);
        tableIndex = prevIndex;
      }

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        // tabIndex + role/aria-label make the scrollable wrapper itself a
        // reachable, named landmark: on a narrow viewport it is the thing
        // that scrolls, so keyboard users need a focus stop to reach it
        // with arrow keys, and screen reader users need an accessible name
        // since a bare wrapping <div> has none of its own (axe:
        // scrollable-region-focusable).
        properties: {
          className: ["table-scroll"],
          tabIndex: 0,
          role: "region",
          ariaLabel: label,
        },
        children: [node],
      };

      parent.children[tableIndex] = wrapper;
      // Continue after the wrapper; there is nothing to visit inside it.
      return [SKIP, tableIndex + 1];
    });
  };
}

// Fenced code blocks get the same treatment as tables, for the same
// reason: prose.css gives <pre> `overflow-x: auto`, so a line wider than a
// phone viewport scrolls inside the block, and a scrollable region that
// cannot take focus is unreachable from the keyboard (axe:
// scrollable-region-focusable, which the desktop-width sweep never sees
// because the block fits there). The name is positional; code blocks have
// no caption convention.
export function rehypeFocusableCode() {
  return (tree: Root) => {
    let count = 0;
    visit(tree, "element", (node) => {
      if (node.tagName !== "pre") return;
      count += 1;
      node.properties = {
        ...node.properties,
        tabIndex: 0,
        role: "region",
        ariaLabel: `Code block ${count}`,
      };
      return SKIP;
    });
  };
}
