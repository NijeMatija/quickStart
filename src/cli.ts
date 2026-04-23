#!/usr/bin/env node
import * as p from "@clack/prompts";
import color from "picocolors";
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, resolve, dirname } from "path";
import { questions } from "./questions.js";
import { runQuestions } from "./engine.js";
import { generateSpec } from "./spec.js";
import { generateInstructions } from "./instructions.js";
import { AGENT_META, AGENT_OPTIONS, AgentTarget } from "./agents.js";
import { smartFill, SmartFillError } from "./smart.js";
import { Answers } from "./types.js";

async function main() {
  console.clear();
  p.intro(color.bgCyan(color.black(" quickStart ")));

  p.note(
    [
      "Answer a short, branching interview about your idea.",
      "Irrelevant sections skip themselves.",
      "",
      color.bold("Output: ") +
        "SPEC.md + an agent instructions file — drop them in a repo",
      "and point your AI coding agent at the folder.",
    ].join("\n"),
    "How this works"
  );

  // Where to write
  const targetDirInput = await p.text({
    message: "Where should we write the output?",
    placeholder: "./my-new-project",
    initialValue: "./my-new-project",
    validate: (v) => (v.trim() ? undefined : "Required"),
  });
  if (p.isCancel(targetDirInput)) return cancel();
  const outDir = resolve(process.cwd(), targetDirInput as string);

  if (existsSync(outDir) && readdirSync(outDir).length > 0) {
    const proceed = await p.confirm({
      message: `${color.yellow(outDir)} already exists and is not empty. Overwrite SPEC.md and agent files if present?`,
      initialValue: false,
    });
    if (p.isCancel(proceed) || !proceed) return cancel();
  }

  // Which agent(s)?
  const agentsSelection = await p.multiselect({
    message: "Which AI coding agent(s) will work on this project?",
    options: AGENT_OPTIONS,
    initialValues: ["claude-code"] as AgentTarget[],
    required: true,
  });
  if (p.isCancel(agentsSelection)) return cancel();
  const selectedAgents = agentsSelection as AgentTarget[];

  // Smart-fill (optional)
  let defaults: Answers = {};
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

  if (hasApiKey) {
    const useSmart = await p.confirm({
      message:
        "Pre-fill answers from a short description using Claude? (ANTHROPIC_API_KEY detected)",
      initialValue: true,
    });
    if (p.isCancel(useSmart)) return cancel();

    if (useSmart) {
      const desc = await p.text({
        message: "Describe your project in 2–5 sentences.",
        placeholder:
          "e.g. A tool for small offices to track who has which physical keys. Web app, team accounts, simple audit log.",
        validate: (v) =>
          v.trim().length < 20 ? "Need a bit more detail" : undefined,
      });
      if (p.isCancel(desc)) return cancel();

      const s = p.spinner();
      s.start("Asking Claude to draft answers");
      try {
        const result = await smartFill(desc as string, questions);
        defaults = result.answers;
        s.stop(
          `Pre-filled ${color.green(String(result.filledCount))} answers${
            result.skippedKeys.length
              ? color.dim(` (${result.skippedKeys.length} skipped)`)
              : ""
          }`
        );
      } catch (err) {
        const msg = err instanceof SmartFillError ? err.message : String(err);
        s.stop(color.yellow(`Smart-fill failed: ${msg}. Continuing manually.`));
      }
    }
  } else {
    p.note(
      [
        "Set " +
          color.cyan("ANTHROPIC_API_KEY") +
          " to enable Claude-powered pre-fill from a short description.",
        color.dim("(Optional. You can always answer every question manually.)"),
      ].join("\n"),
      "Tip"
    );
  }

  // Interview
  const answers = await runQuestions(questions, defaults);

  // Write files
  const s = p.spinner();
  const fileCount = 1 + selectedAgents.length;
  s.start(`Writing SPEC.md and ${selectedAgents.length} agent file(s)`);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "SPEC.md"), generateSpec(answers), "utf8");

  const writtenPaths: string[] = ["SPEC.md"];
  for (const target of selectedAgents) {
    const rel = AGENT_META[target].filePath;
    const abs = join(outDir, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, generateInstructions(answers, target), "utf8");
    writtenPaths.push(rel);
  }

  s.stop(`Wrote ${fileCount} file(s) to ${color.cyan(outDir)}`);

  p.outro(
    [
      color.green("Done!"),
      "",
      color.bold("Files written:"),
      ...writtenPaths.map((f) => `  ${color.dim("•")} ${f}`),
      "",
      color.bold("Next steps:"),
      `  ${color.dim("1.")} cd ${targetDirInput}`,
      `  ${color.dim("2.")} Skim SPEC.md — adjust anything that's off.`,
      `  ${color.dim("3.")} Open the folder with your AI coding agent.`,
      `  ${color.dim("4.")} It reads the instructions file → SPEC.md and scaffolds.`,
      "",
    ].join("\n")
  );
}

function cancel() {
  p.cancel("Cancelled. No files written.");
  process.exit(0);
}

main().catch((err) => {
  p.cancel(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
