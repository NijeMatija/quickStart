#!/usr/bin/env node
import * as p from "@clack/prompts";
import color from "picocolors";
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { questions } from "./questions.js";
import { runQuestions } from "./engine.js";
import { generateSpec } from "./spec.js";
import { generateClaudeMd } from "./claude.js";

async function main() {
  console.clear();
  p.intro(color.bgCyan(color.black(" quickStart ")));

  p.note(
    [
      "Answer a short, branching interview about your idea.",
      "Irrelevant sections skip themselves.",
      "",
      color.bold("Output: ") + "SPEC.md + CLAUDE.md — drop them in a repo",
      "and point your AI coding agent at the folder.",
    ].join("\n"),
    "How this works"
  );

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
      message: `${color.yellow(outDir)} already exists and is not empty. Overwrite SPEC.md / CLAUDE.md if present?`,
      initialValue: false,
    });
    if (p.isCancel(proceed) || !proceed) return cancel();
  }

  const answers = await runQuestions(questions);

  const s = p.spinner();
  s.start("Writing SPEC.md and CLAUDE.md");

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "SPEC.md"), generateSpec(answers), "utf8");
  writeFileSync(join(outDir, "CLAUDE.md"), generateClaudeMd(answers), "utf8");

  s.stop(`Wrote files to ${color.cyan(outDir)}`);

  p.outro(
    [
      color.green("Done!"),
      "",
      color.bold("Next steps:"),
      `  ${color.dim("1.")} cd ${targetDirInput}`,
      `  ${color.dim("2.")} Skim SPEC.md — adjust anything that's off.`,
      `  ${color.dim("3.")} Open the folder with Claude Code or Cursor.`,
      `  ${color.dim("4.")} Your agent reads CLAUDE.md → SPEC.md and scaffolds.`,
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
