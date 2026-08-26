import { describe, it, expect } from "vitest";
import {
  sortByDateDesc,
  publishedPosts,
  filterByTopic,
  withYearMarkers,
  sortByKind,
  openRoles,
  groupRolesByCategory,
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
  it("marks each year exactly once even with unsorted repeated years", () => {
    const out = withYearMarkers([
      post("a", "2025-01-01"),
      post("b", "2026-06-01"),
      post("c", "2025-12-01"),
    ]);
    expect(out.map((e) => e.yearMarker)).toEqual(["2025", "2026", null]);
  });
});

const product = (id: string, kind: "hardware" | "software") =>
  ({ id, data: { kind } }) as any;

describe("sortByKind", () => {
  it("puts hardware before software", () => {
    const out = sortByKind([product("a", "software"), product("b", "hardware")]);
    expect(out.map((p) => p.id)).toEqual(["b", "a"]);
  });
  it("preserves relative order within the same kind", () => {
    const out = sortByKind([
      product("a", "hardware"),
      product("b", "software"),
      product("c", "hardware"),
      product("d", "software"),
    ]);
    expect(out.map((p) => p.id)).toEqual(["a", "c", "b", "d"]);
  });
  it("does not mutate its input", () => {
    const input = [product("a", "software"), product("b", "hardware")];
    sortByKind(input);
    expect(input.map((p) => p.id)).toEqual(["a", "b"]);
  });
});

const role = (
  id: string,
  category: string,
  order: number,
  open = true,
) => ({ id, data: { category, order, open } }) as any;

describe("openRoles", () => {
  it("keeps only roles marked open", () => {
    const out = openRoles([
      role("a", "Engineering", 0, true),
      role("b", "Engineering", 1, false),
    ]);
    expect(out.map((r) => r.id)).toEqual(["a"]);
  });

  it("does not mutate its input", () => {
    const input = [role("a", "Engineering", 0, true), role("b", "Engineering", 1, false)];
    openRoles(input);
    expect(input).toHaveLength(2);
  });
});

describe("groupRolesByCategory", () => {
  it("buckets roles under their category", () => {
    const out = groupRolesByCategory([
      role("a", "Engineering", 0),
      role("b", "Education", 0),
      role("c", "Engineering", 1),
    ]);
    expect(out.map((g) => g.category)).toEqual(["Engineering", "Education"]);
    expect(out.find((g) => g.category === "Engineering")!.roles.map((r) => r.id)).toEqual([
      "a",
      "c",
    ]);
    expect(out.find((g) => g.category === "Education")!.roles.map((r) => r.id)).toEqual(["b"]);
  });

  it("orders roles within a category by their order field", () => {
    const out = groupRolesByCategory([
      role("second", "Engineering", 1),
      role("first", "Engineering", 0),
    ]);
    expect(out[0].roles.map((r) => r.id)).toEqual(["first", "second"]);
  });

  it("orders categories by first appearance in order-sorted input", () => {
    const out = groupRolesByCategory([
      role("a", "Engineering", 5),
      role("b", "Education", 0),
    ]);
    expect(out.map((g) => g.category)).toEqual(["Education", "Engineering"]);
  });

  it("does not mutate its input", () => {
    const input = [role("a", "Engineering", 1), role("b", "Engineering", 0)];
    groupRolesByCategory(input);
    expect(input.map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("returns an empty array unchanged", () => {
    expect(groupRolesByCategory([])).toEqual([]);
  });
});
