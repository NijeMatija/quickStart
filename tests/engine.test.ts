import { describe, it, expect, vi, beforeEach } from "vitest";

const promptState = vi.hoisted(() => ({
  multiselectResponses: [] as unknown[],
  textResponses: [] as unknown[],
  multiselectCalls: [] as unknown[],
  textCalls: [] as unknown[],
}));

vi.mock("@clack/prompts", () => ({
  multiselect: vi.fn((args: unknown) => {
    promptState.multiselectCalls.push(args);
    return promptState.multiselectResponses.shift();
  }),
  text: vi.fn((args: unknown) => {
    promptState.textCalls.push(args);
    return promptState.textResponses.shift();
  }),
  note: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn(() => false),
}));

const { runQuestions } = await import("../src/engine.js");

describe("runQuestions", () => {
  beforeEach(() => {
    promptState.multiselectResponses = [];
    promptState.textResponses = [];
    promptState.multiselectCalls = [];
    promptState.textCalls = [];
  });

  it("passes required through to multiselect prompts", async () => {
    promptState.multiselectResponses = [["web"]];

    await runQuestions([
      {
        id: "platforms",
        category: "Platforms",
        type: "multiselect",
        label: "Which platforms?",
        required: true,
        allowCustom: false,
        options: [{ value: "web", label: "Web app" }],
      },
    ]);

    expect(promptState.multiselectCalls[0]).toMatchObject({ required: true });
  });

  it("does not save /skip as a custom multiselect value", async () => {
    promptState.multiselectResponses = [["slack", "__custom__"]];
    promptState.textResponses = ["/skip"];

    const answers = await runQuestions([
      {
        id: "integrations",
        category: "Integrations",
        type: "multiselect",
        label: "Which integrations?",
        options: [{ value: "slack", label: "Slack" }],
      },
    ]);

    expect(answers.integrations).toEqual(["slack"]);
  });

  it("re-prompts a required multiselect when skipping custom leaves no values", async () => {
    promptState.multiselectResponses = [["__custom__"], ["web"]];
    promptState.textResponses = ["/skip"];

    const answers = await runQuestions([
      {
        id: "platforms",
        category: "Platforms",
        type: "multiselect",
        label: "Which platforms?",
        required: true,
        options: [{ value: "web", label: "Web app" }],
      },
    ]);

    expect(promptState.multiselectCalls).toHaveLength(2);
    expect(answers.platforms).toEqual(["web"]);
  });
});
