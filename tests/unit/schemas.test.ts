import { describe, it, expect } from "vitest";
import { TIERS, TOPICS } from "../../src/lib/taxonomy";

describe("taxonomy", () => {
  it("defines exactly three tiers", () => {
    expect([...TIERS]).toEqual(["major", "progress", "standard"]);
  });
  it("defines exactly three topics", () => {
    expect([...TOPICS]).toEqual(["community", "research", "product"]);
  });
});
