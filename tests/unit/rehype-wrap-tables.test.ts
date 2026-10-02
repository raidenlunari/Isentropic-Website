import { describe, it, expect } from "vitest";
import type { Element, Root, Text } from "hast";
import { rehypeFocusableCode, rehypeWrapTables } from "../../src/lib/rehype-wrap-tables";

// hast trees built by hand: the plugin only cares about element names,
// children, and properties, and keeping the fixtures literal makes each
// assertion readable without a Markdown-to-hast round trip.
const text = (value: string): Text => ({ type: "text", value });
const el = (tagName: string, children: Element["children"] = [], properties = {}): Element => ({
  type: "element",
  tagName,
  properties,
  children,
});
const table = () => el("table", [el("tbody", [el("tr", [el("td", [text("1")])])])]);
const root = (...children: Root["children"]): Root => ({ type: "root", children });

function run(tree: Root) {
  rehypeWrapTables()(tree);
  return tree;
}

const wrappers = (tree: Root) =>
  tree.children.filter(
    (n): n is Element => n.type === "element" && n.tagName === "div",
  );

describe("rehypeWrapTables", () => {
  it("wraps a table in a focusable, named scroll region and leaves the table intact", () => {
    const tree = run(root(table()));
    expect(tree.children).toHaveLength(1);
    const [wrapper] = wrappers(tree);
    expect(wrapper.properties).toMatchObject({
      className: ["table-scroll"],
      tabIndex: 0,
      role: "region",
      ariaLabel: "Scrollable table 1",
    });
    expect(wrapper.children).toHaveLength(1);
    expect((wrapper.children[0] as Element).tagName).toBe("table");
  });

  it("names uncaptioned tables by position so two on one page differ", () => {
    const tree = run(root(table(), text("\n"), table()));
    expect(wrappers(tree).map((w) => w.properties.ariaLabel)).toEqual([
      "Scrollable table 1",
      "Scrollable table 2",
    ]);
  });

  it('turns a preceding "Table N." paragraph into the caption and the region name', () => {
    const tree = run(
      root(
        el("p", [text("Intro paragraph.")]),
        text("\n"),
        el("p", [text("Table 1. Four-lap results, "), el("em", [text("cm")]), text(".")]),
        text("\n"),
        table(),
        text("\n"),
        el("p", [text("After.")]),
      ),
    );
    // The caption paragraph is gone from the flow; the intro and the
    // trailing paragraph are still where they were around the wrapper.
    const tags = tree.children.filter((n) => n.type === "element").map((n) => (n as Element).tagName);
    expect(tags).toEqual(["p", "div", "p"]);
    const [wrapper] = wrappers(tree);
    expect(wrapper.properties.ariaLabel).toBe("Table 1. Four-lap results, cm.");
    const wrapped = wrapper.children[0] as Element;
    const caption = wrapped.children[0] as Element;
    expect(caption.tagName).toBe("caption");
    expect(caption.children).toHaveLength(3);
    expect((caption.children[1] as Element).tagName).toBe("em");
  });

  it("accepts a colon after the number and ignores paragraphs that merely mention a table", () => {
    const captioned = run(root(el("p", [text("Table 2: Costs")]), table()));
    expect(wrappers(captioned)[0].properties.ariaLabel).toBe("Table 2: Costs");

    const plain = run(root(el("p", [text("The table below lists costs.")]), table()));
    expect(plain.children).toHaveLength(2);
    expect(wrappers(plain)[0].properties.ariaLabel).toBe("Scrollable table 1");
  });

  it("keeps visiting correctly after removing a caption paragraph", () => {
    const tree = run(
      root(
        el("p", [text("Table 1. First")]),
        table(),
        el("p", [text("Table 2. Second")]),
        table(),
        el("p", [text("Tail")]),
      ),
    );
    expect(wrappers(tree).map((w) => w.properties.ariaLabel)).toEqual([
      "Table 1. First",
      "Table 2. Second",
    ]);
    const last = tree.children[tree.children.length - 1] as Element;
    expect(last.tagName).toBe("p");
  });
});

describe("rehypeFocusableCode", () => {
  it("makes every pre a focusable, positionally named region", () => {
    const tree = root(el("pre", [el("code", [text("x")])]), el("pre", [el("code", [text("y")])]));
    rehypeFocusableCode()(tree);
    const pres = tree.children as Element[];
    expect(pres[0].properties).toMatchObject({ tabIndex: 0, role: "region", ariaLabel: "Code block 1" });
    expect(pres[1].properties.ariaLabel).toBe("Code block 2");
  });

  it("keeps existing pre properties", () => {
    const tree = root(el("pre", [], { className: ["astro-code"] }));
    rehypeFocusableCode()(tree);
    expect((tree.children[0] as Element).properties.className).toEqual(["astro-code"]);
  });
});
