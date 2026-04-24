import * as p from "@clack/prompts";
import color from "picocolors";
import { Answers, Question } from "./types.js";

// Sentinels returned by prompts.
const BACK = "__back__";
const CUSTOM = "__custom__";

// Defaults: multiselect allows custom entries, select does not.
const customAllowed = (q: Question): boolean =>
  q.allowCustom ?? q.type === "multiselect";

export interface ProgressSnapshot {
  answers: Answers;
  askedStack: string[];
  index: number;
}

export interface RunQuestionsOptions {
  defaults?: Answers;
  resumeState?: ProgressSnapshot;
  onProgress?: (snapshot: ProgressSnapshot) => void;
}

interface Progress {
  current: number;
  total: number;
}

export async function runQuestions(
  questions: Question[],
  opts: RunQuestionsOptions = {}
): Promise<Answers> {
  const { defaults = {}, resumeState, onProgress } = opts;

  const answers: Answers = resumeState
    ? { ...resumeState.answers }
    : { ...defaults };
  const askedStack: string[] = resumeState ? [...resumeState.askedStack] : [];

  const categories = Array.from(new Set(questions.map((q) => q.category)));

  let index = resumeState ? resumeState.index : 0;
  let currentCategory = "";
  let askedCount = askedStack.length;
  // Suppress multiselect tip if a multiselect was already answered
  // in a prior session (resume) — the user's seen it.
  let shownMultiselectTip = askedStack.some((id) => {
    const q = questions.find((qq) => qq.id === id);
    return q?.type === "multiselect";
  });

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
          "",
          color.dim("Pick ") +
            color.cyan("+ Add custom…") +
            color.dim(" to type your own entries if none of the options fit."),
        ].join("\n"),
        color.dim("Multi-select tip")
      );
      shownMultiselectTip = true;
    }

    // Progress estimate. Count remaining questions not currently skipped by
    // answers so far; user choices downstream can still change these.
    let remaining = 0;
    for (let i = index; i < questions.length; i++) {
      if (!questions[i].skipIf?.(answers)) remaining++;
    }
    const progress: Progress = {
      current: askedCount + 1,
      total: askedCount + remaining,
    };

    const canGoBack = askedStack.length > 0;
    const preset = defaults[q.id];
    const hasPreset = preset !== undefined && preset !== null && preset !== "";

    const value = await ask(
      q,
      hasPreset ? preset : undefined,
      canGoBack,
      progress
    );

    if (p.isCancel(value)) {
      p.cancel("Cancelled. Progress saved — rerun to resume.");
      process.exit(0);
    }

    // Back — wins over custom if both are toggled in a multiselect.
    const wantsBack =
      value === BACK ||
      (typeof value === "string" && value.trim() === "/back") ||
      (Array.isArray(value) && value.includes(BACK));

    if (wantsBack) {
      const lastId = askedStack.pop();
      if (lastId) {
        delete answers[lastId];
        askedCount = Math.max(0, askedCount - 1);
        index = questions.findIndex((qq) => qq.id === lastId);
      }
      onProgress?.({ answers, askedStack, index });
      continue;
    }

    // Custom handling — expand the sentinel into user-typed values.
    let finalValue: unknown = value;

    if (
      q.type === "multiselect" &&
      Array.isArray(value) &&
      value.includes(CUSTOM)
    ) {
      const typed = await promptForCustomList(q);
      if (p.isCancel(typed)) {
        p.cancel("Cancelled. Progress saved — rerun to resume.");
        process.exit(0);
      }
      finalValue = [...value.filter((v) => v !== CUSTOM), ...typed];
    } else if (q.type === "select" && value === CUSTOM) {
      const typed = await promptForCustomSingle(q);
      if (p.isCancel(typed)) {
        p.cancel("Cancelled. Progress saved — rerun to resume.");
        process.exit(0);
      }
      finalValue = typed;
    }

    answers[q.id] = finalValue;
    askedStack.push(q.id);
    askedCount++;
    index++;

    onProgress?.({ answers, askedStack, index });
  }

  p.note(color.dim(`${askedCount} questions answered`), "Done");
  return answers;
}

async function promptForCustomList(q: Question): Promise<string[] | symbol> {
  const raw = await p.text({
    message: `Add custom entries for "${q.label}"`,
    placeholder: "Comma-separated. e.g. discord, microsoft-teams",
    validate: (v) =>
      v.trim().length === 0
        ? "Type at least one value, or /skip to cancel."
        : undefined,
  });
  if (p.isCancel(raw)) return raw;
  const parts = (raw as string)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [];
}

async function promptForCustomSingle(q: Question): Promise<string | symbol> {
  const raw = await p.text({
    message: `Custom value for "${q.label}"`,
    placeholder: "Type your own",
    validate: (v) => (v.trim() ? undefined : "Required"),
  });
  if (p.isCancel(raw)) return raw;
  return (raw as string).trim();
}

type Ask = (
  q: Question,
  preset: unknown,
  canGoBack: boolean,
  progress: Progress
) => Promise<unknown | symbol>;

const backOption = {
  value: BACK,
  label: color.dim("← Go back"),
  hint: "Revise the previous answer",
};

const customOption = {
  value: CUSTOM,
  label: "+ Add custom…",
  hint: "Type your own entry",
};

function augmentOptions(q: Question, canGoBack: boolean) {
  const base = q.options ?? [];
  const withCustom = customAllowed(q) ? [...base, customOption] : base;
  return canGoBack ? [...withCustom, backOption] : withCustom;
}

function progressPrefix(progress: Progress): string {
  return color.dim(`Q${progress.current}/~${progress.total}`) + "  ";
}

const ask: Ask = async (q, preset, canGoBack, progress) => {
  const prefix = progressPrefix(progress);
  switch (q.type) {
    case "text":
      return p.text({
        message:
          prefix +
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
          message: prefix + q.label,
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
        message: prefix + q.label,
        initialValue:
          (preset as boolean | undefined) ??
          (q.defaultValue as boolean | undefined) ??
          true,
      });
    }

    case "select":
      return p.select({
        message: prefix + q.label,
        options: augmentOptions(q, canGoBack),
        initialValue:
          (preset as string | undefined) ??
          (q.defaultValue as string | undefined),
      });

    case "multiselect":
      return p.multiselect({
        message: prefix + q.label,
        options: augmentOptions(q, canGoBack),
        initialValues:
          (preset as string[] | undefined) ??
          (q.defaultValue as string[] | undefined) ??
          [],
        required: false,
      });
  }
};
