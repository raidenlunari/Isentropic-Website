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
