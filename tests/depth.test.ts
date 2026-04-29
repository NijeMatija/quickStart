import { describe, it, expect } from "vitest";
import { filterByDepth } from "../src/depth.js";
import { questions } from "../src/questions.js";

describe("filterByDepth", () => {
  it("returns all questions for deep mode", () => {
    const filtered = filterByDepth(questions, "deep");
    expect(filtered.length).toBe(questions.length);
  });

  it("returns a subset for quick mode", () => {
    const filtered = filterByDepth(questions, "quick");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(questions.length);
  });

  it("returns a larger subset for standard mode than quick", () => {
    const quick = filterByDepth(questions, "quick");
    const standard = filterByDepth(questions, "standard");
    expect(standard.length).toBeGreaterThan(quick.length);
    expect(standard.length).toBeLessThan(questions.length);
  });

  it("includes identity questions in quick mode", () => {
    const filtered = filterByDepth(questions, "quick");
    const ids = filtered.map((q) => q.id);
    expect(ids).toContain("name");
    expect(ids).toContain("tagline");
    expect(ids).toContain("description");
  });

  it("excludes ops questions from quick mode", () => {
    const filtered = filterByDepth(questions, "quick");
    const ids = filtered.map((q) => q.id);
    expect(ids).not.toContain("logging");
    expect(ids).not.toContain("monitoring");
  });
});
