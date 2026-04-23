import * as p from "@clack/prompts";
import color from "picocolors";
import { Answers, Question } from "./types.js";

export async function runQuestions(
  questions: Question[],
  defaults: Answers = {}
): Promise<Answers> {
  const answers: Answers = { ...defaults };
  let currentCategory = "";
  let askedCount = 0;
  let prefilledCount = 0;
  let sectionIndex = 0;

  const categories = Array.from(new Set(questions.map((q) => q.category)));

  for (const q of questions) {
    if (q.skipIf?.(answers)) continue;

    if (q.category !== currentCategory) {
      currentCategory = q.category;
      sectionIndex = categories.indexOf(currentCategory) + 1;
      p.note(
        color.dim(`Section ${sectionIndex}/${categories.length}`),
        color.cyan(currentCategory)
      );
    }

    const preset = defaults[q.id];
    const hasPreset = preset !== undefined && preset !== null && preset !== "";
    askedCount++;

    const value = await ask(q, hasPreset ? preset : undefined);

    if (p.isCancel(value)) {
      p.cancel("Cancelled. No files written.");
      process.exit(0);
    }

    answers[q.id] = value;
    if (hasPreset && value === preset) prefilledCount++;
  }

  const summary = prefilledCount
    ? `${askedCount} questions answered (${prefilledCount} pre-filled)`
    : `${askedCount} questions answered`;
  p.note(color.dim(summary), "Done");
  return answers;
}

async function ask(q: Question, preset: unknown) {
  switch (q.type) {
    case "text":
      return p.text({
        message: q.label,
        placeholder: q.placeholder,
        initialValue:
          (preset as string | undefined) ??
          (q.defaultValue as string | undefined),
        validate: (v) => {
          if (q.required && !v.trim()) return "Required";
          return q.validate?.(v);
        },
      });
    case "confirm":
      return p.confirm({
        message: q.label,
        initialValue:
          (preset as boolean | undefined) ??
          (q.defaultValue as boolean | undefined) ??
          true,
      });
    case "select":
      return p.select({
        message: q.label,
        options: q.options ?? [],
        initialValue:
          (preset as string | undefined) ??
          (q.defaultValue as string | undefined),
      });
    case "multiselect":
      return p.multiselect({
        message: q.label,
        options: q.options ?? [],
        initialValues:
          (preset as string[] | undefined) ??
          (q.defaultValue as string[] | undefined) ??
          [],
        required: false,
      });
  }
}
