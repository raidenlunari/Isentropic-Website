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
