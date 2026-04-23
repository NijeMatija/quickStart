import * as p from "@clack/prompts";
import color from "picocolors";
import { Answers, Question } from "./types.js";

export async function runQuestions(questions: Question[]): Promise<Answers> {
  const answers: Answers = {};
  let currentCategory = "";
  let askedCount = 0;
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

    askedCount++;
    const value = await ask(q);

    if (p.isCancel(value)) {
      p.cancel("Cancelled. No files written.");
      process.exit(0);
    }

    answers[q.id] = value;
  }

  p.note(color.dim(`${askedCount} questions answered`), "Done");
  return answers;
}

async function ask(q: Question) {
  switch (q.type) {
    case "text":
      return p.text({
        message: q.label,
        placeholder: q.placeholder,
        initialValue: (q.defaultValue as string) ?? undefined,
        validate: (v) => {
          if (q.required && !v.trim()) return "Required";
          return q.validate?.(v);
        },
      });
    case "confirm":
      return p.confirm({
        message: q.label,
        initialValue: (q.defaultValue as boolean) ?? true,
      });
    case "select":
      return p.select({
        message: q.label,
        options: q.options ?? [],
        initialValue: q.defaultValue as string | undefined,
      });
    case "multiselect":
      return p.multiselect({
        message: q.label,
        options: q.options ?? [],
        initialValues: (q.defaultValue as string[]) ?? [],
        required: false,
      });
  }
}
