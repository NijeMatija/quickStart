import { describe, it, expect } from "vitest";
import { filterByDepth } from "../src/depth.js";
import { questions } from "../src/questions.js";
import {
  defaultsForTechnicalLevel,
  filterByTechnicalLevel,
} from "../src/technical.js";

describe("technical comfort filtering", () => {
  it("keeps the guided interview unchanged", () => {
    const standard = filterByDepth(questions, "standard");
    expect(filterByTechnicalLevel(standard, "guided")).toEqual(standard);
  });

  it("removes implementation jargon for non-technical users", () => {
    const ids = filterByTechnicalLevel(
      filterByDepth(questions, "standard"),
      "nontechnical"
    ).map((q) => q.id);

    expect(ids).toContain("name");
    expect(ids).toContain("topFeatures");
    expect(ids).toContain("dbNeeded");
    expect(ids).not.toContain("frontendFramework");
    expect(ids).not.toContain("orm");
    expect(ids).not.toContain("hosting");
    expect(ids).not.toContain("logging");
  });

  it("defaults skipped technical choices to agent-picked decisions", () => {
    const defaults = defaultsForTechnicalLevel("nontechnical");
    expect(defaults.technicalLevel).toBe("nontechnical");
    expect(defaults.frontendFramework).toBe("no-pref");
    expect(defaults.hosting).toBe("undecided");
    expect(defaults.logging).toBe("later");
  });
});
