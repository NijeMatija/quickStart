import * as p from "@clack/prompts";
import color from "picocolors";
import { Answers, Question } from "./types.js";

// Sentinel returned by prompts when the user asks to revise the previous answer.
const BACK = "__back__";

export async function runQuestions(
  questions: Question[],
  defaults: Answers = {}
): Promise<Answers> {
  const answers: Answers = { ...defaults };
  const askedStack: string[] = []; // ids of questions actually asked, in order
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  let index = 0;
  let currentCategory = "";
  let askedCount = 0;
  let shownMultiselectTip = false;

  while (index < questions.length) {
    const q = questions[index];

    if (q.skipIf?.(answers)) {
      index++;
      continue;
    }

    if (q.category !== currentCategory) {
      currentCategory = q.category;
      const sectionIndex = categories.indexOf(currentCategory) + 1;
      p.note(
        color.dim(`Section ${sectionIndex}/${categories.length}`),
        color.cyan(currentCategory)
      );
    }

    if (q.type === "multiselect" && !shownMultiselectTip) {
      p.note(
        [
          "Use " + color.cyan("↑ ↓") + " to move between options.",
          "Press " + color.cyan("space") + " to toggle each one you want.",
          "Press " + color.cyan("enter") + " to confirm your selection.",
        ].join("\n"),
        color.dim("Multi-select tip")
      );
      shownMultiselectTip = true;
    }

    const canGoBack = askedStack.length > 0;
    const preset = defaults[q.id];
    const hasPreset = preset !== undefined && preset !== null && preset !== "";

    const value = await ask(q, hasPreset ? preset : undefined, canGoBack);

    if (p.isCancel(value)) {
      p.cancel("Cancelled. No files written.");
      process.exit(0);
    }

    // Back handling — sentinel from select/confirm, "/back" from text,
    // or a multiselect whose only toggled option is the back sentinel.
    const wantsBack =
      value === BACK ||
      (typeof value === "string" && value.trim() === "/back") ||
      (Array.isArray(value) && value.length === 1 && value[0] === BACK);

    if (wantsBack) {
      const lastId = askedStack.pop();
      if (lastId) {
        delete answers[lastId];
        askedCount = Math.max(0, askedCount - 1);
        index = questions.findIndex((qq) => qq.id === lastId);
      }
      continue;
    }

    // If a multiselect included BACK alongside other options, silently drop it.
    const finalValue = Array.isArray(value)
      ? value.filter((v) => v !== BACK)
      : value;

    answers[q.id] = finalValue;
    askedStack.push(q.id);
    askedCount++;
    index++;
  }

  p.note(color.dim(`${askedCount} questions answered`), "Done");
  return answers;
}

type Ask = (
  q: Question,
  preset: unknown,
  canGoBack: boolean
) => Promise<unknown | symbol>;

const backOption = {
  value: BACK,
  label: color.dim("← Go back"),
  hint: "Revise the previous answer",
};

const ask: Ask = async (q, preset, canGoBack) => {
  switch (q.type) {
    case "text":
      return p.text({
        message:
          q.label +
          (canGoBack
            ? "  " + color.dim("(type /back to revise the previous answer)")
            : ""),
        placeholder: q.placeholder,
        initialValue:
          (preset as string | undefined) ??
          (q.defaultValue as string | undefined),
        validate: (v) => {
          if (v.trim() === "/back") {
            return canGoBack ? undefined : "No previous question to go back to.";
          }
          if (q.required && !v.trim()) return "Required";
          return q.validate?.(v);
        },
      });

    case "confirm": {
      // Promote confirm to a 3-way select once back-navigation is available,
      // so users can revise the previous answer from any step.
      if (canGoBack) {
        const initial =
          preset === true
            ? "yes"
            : preset === false
              ? "no"
              : q.defaultValue === false
                ? "no"
                : "yes";
        const choice = await p.select({
          message: q.label,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            backOption,
          ],
          initialValue: initial,
        });
        if (p.isCancel(choice)) return choice;
        if (choice === BACK) return BACK;
        return choice === "yes";
      }
      return p.confirm({
        message: q.label,
        initialValue:
          (preset as boolean | undefined) ??
          (q.defaultValue as boolean | undefined) ??
          true,
      });
    }

    case "select":
      return p.select({
        message: q.label,
        options: canGoBack
          ? [...(q.options ?? []), backOption]
          : (q.options ?? []),
        initialValue:
          (preset as string | undefined) ??
          (q.defaultValue as string | undefined),
      });

    case "multiselect":
      return p.multiselect({
        message: q.label,
        options: canGoBack
          ? [...(q.options ?? []), backOption]
          : (q.options ?? []),
        initialValues:
          (preset as string[] | undefined) ??
          (q.defaultValue as string[] | undefined) ??
          [],
        required: false,
      });
  }
};
