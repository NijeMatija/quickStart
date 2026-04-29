#!/usr/bin/env node
import * as p from "@clack/prompts";
import color from "picocolors";
import {
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  unlinkSync,
} from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { questions } from "./questions.js";
import { runQuestions, ProgressSnapshot } from "./engine.js";
import { generateSpec } from "./spec.js";
import { generateInstructions } from "./instructions.js";
import { AGENT_META, AGENT_OPTIONS, AgentTarget } from "./agents.js";
import { smartFill, SmartFillError } from "./smart.js";
import { Answers } from "./types.js";
import { Depth, DEPTH_OPTIONS, filterByDepth } from "./depth.js";
import { estimateCosts } from "./pricing.js";

// Read version from package.json at runtime so the banner stays in sync
// with whatever npm actually installed.
const __dirname = dirname(fileURLToPath(import.meta.url));
const VERSION: string = (() => {
  try {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, "..", "package.json"), "utf8")
    );
    return pkg.version ?? "";
  } catch {
    return "";
  }
})();

// ASCII banner shown at the start of every run. Uses "ANSI Shadow" style
// block characters for the wordmark + a lightning tagline below. Width is
// ~82 chars — fits modern terminals comfortably; narrow terminals (<82
// cols) will fall back to a simpler banner.
function renderBanner() {
  const narrow = (process.stdout.columns ?? 80) < 82;

  if (narrow) {
    // Compact fallback for small terminals.
    console.log();
    console.log(
      "  " +
        color.yellow("⚡ ") +
        color.bold(color.cyan("quickStart")) +
        "  " +
        color.dim(VERSION ? `v${VERSION}` : "")
    );
    console.log("  " + color.dim("─".repeat(40)));
    console.log("  " + color.dim("Turn your idea into a SPEC your AI"));
    console.log("  " + color.dim("coding agent can ship — in 5 minutes."));
    console.log();
    return;
  }

  const wordmark = [
    " ██████╗ ██╗   ██╗██╗ ██████╗██╗  ██╗███████╗████████╗ █████╗ ██████╗ ████████╗",
    "██╔═══██╗██║   ██║██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝",
    "██║   ██║██║   ██║██║██║     █████╔╝ ███████╗   ██║   ███████║██████╔╝   ██║   ",
    "██║▄▄ ██║██║   ██║██║██║     ██╔═██╗ ╚════██║   ██║   ██╔══██║██╔══██╗   ██║   ",
    "╚██████╔╝╚██████╔╝██║╚██████╗██║  ██╗███████║   ██║   ██║  ██║██║  ██║   ██║   ",
    " ╚══▀▀═╝  ╚═════╝ ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ",
  ].map((line) => color.cyan(line));

  const tagline =
    "   " +
    color.yellow("⚡  ") +
    color.dim("Turn your idea into a SPEC your AI coding agent can ship.");
  const versionLine = VERSION
    ? "   " +
      color.dim("    npx quickstart-ai") +
      color.dim("  ·  ") +
      color.cyan(`v${VERSION}`)
    : "";

  console.log();
  console.log(wordmark.join("\n"));
  console.log();
  console.log(tagline);
  if (versionLine) console.log(versionLine);
  console.log();
}

const PROGRESS_FILE = join(process.cwd(), ".quickstart-progress.json");

interface SavedSession {
  version: 1;
  savedAt: string;
  targetDirInput: string;
  outDir: string;
  selectedAgents: AgentTarget[];
  depth: Depth;
  answers: Answers;
  askedStack: string[];
  index: number;
}

function loadSavedSession(): SavedSession | null {
  if (!existsSync(PROGRESS_FILE)) return null;
  try {
    const raw = JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
    if (raw?.version !== 1) return null;
    if (typeof raw.targetDirInput !== "string") return null;
    if (!Array.isArray(raw.selectedAgents)) return null;
    if (!Array.isArray(raw.askedStack)) return null;
    if (typeof raw.index !== "number") return null;
    return raw as SavedSession;
  } catch {
    return null;
  }
}

function deleteProgressFile() {
  try {
    unlinkSync(PROGRESS_FILE);
  } catch {
    /* best-effort */
  }
}

function writeProgress(snapshot: SavedSession) {
  try {
    writeFileSync(PROGRESS_FILE, JSON.stringify(snapshot, null, 2), "utf8");
  } catch {
    /* best-effort */
  }
}

async function main() {
  console.clear();
  renderBanner();

  p.note(
    [
      "Answer a short, branching interview about your idea.",
      "Irrelevant sections skip themselves.",
      "",
      color.dim("Made a mistake? Pick ") +
        color.cyan("← Go back") +
        color.dim(" on any list, or type ") +
        color.cyan("/back") +
        color.dim(" in a text field."),
      "",
      color.dim("Progress is autosaved — ") +
        color.cyan("Ctrl+C") +
        color.dim(" anytime and rerun to resume."),
      "",
      color.bold("Output: ") +
        "SPEC.md + an agent instructions file — drop them in a repo",
      "and point your AI coding agent at the folder.",
    ].join("\n"),
    "How this works"
  );

  // Resume?
  const saved = loadSavedSession();
  let session: SavedSession | null = null;

  if (saved) {
    p.note(
      [
        color.bold("Saved progress found") +
          color.dim(` (saved ${saved.savedAt.slice(0, 19).replace("T", " ")})`),
        "",
        `Target folder: ${color.cyan(saved.targetDirInput)}`,
        `Depth: ${color.cyan(saved.depth)}`,
        `Agents: ${color.cyan(saved.selectedAgents.join(", "))}`,
        `Questions answered: ${color.green(String(saved.askedStack.length))}`,
      ].join("\n"),
      color.dim("Resume?")
    );
    const choice = await p.select({
      message: "What would you like to do?",
      options: [
        {
          value: "resume",
          label: "Resume from saved progress",
          hint: "Pick up right where you left off",
        },
        {
          value: "fresh",
          label: "Start fresh",
          hint: "Deletes the saved progress file",
        },
      ],
      initialValue: "resume",
    });
    if (p.isCancel(choice)) return cancel();
    if (choice === "resume") {
      session = saved;
    } else {
      deleteProgressFile();
    }
  }

  let targetDirInput: string;
  let outDir: string;
  let selectedAgents: AgentTarget[];
  let depth: Depth;
  let defaults: Answers = {};
  let resumeState: ProgressSnapshot | undefined;

  if (session) {
    targetDirInput = session.targetDirInput;
    outDir = session.outDir;
    selectedAgents = session.selectedAgents;
    depth = session.depth;
    resumeState = {
      answers: session.answers,
      askedStack: session.askedStack,
      index: session.index,
    };
  } else {
    // Where to write
    const targetDirInputRaw = await p.text({
      message: "Where should we write the output?",
      placeholder: "./my-new-project",
      initialValue: "./my-new-project",
      validate: (v) => (v.trim() ? undefined : "Required"),
    });
    if (p.isCancel(targetDirInputRaw)) return cancel();
    targetDirInput = targetDirInputRaw as string;
    outDir = resolve(process.cwd(), targetDirInput);

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
    selectedAgents = agentsSelection as AgentTarget[];

    // Depth
    const depthChoice = await p.select({
      message: "How thorough should the interview be?",
      options: DEPTH_OPTIONS,
      initialValue: "standard" as Depth,
    });
    if (p.isCancel(depthChoice)) return cancel();
    depth = depthChoice as Depth;

    // Smart-fill (optional)
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
          // Filter first so smart-fill only drafts questions we'll actually ask.
          const filtered = filterByDepth(questions, depth);
          const result = await smartFill(desc as string, filtered);
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
          s.stop(
            color.yellow(`Smart-fill failed: ${msg}. Continuing manually.`)
          );
        }
      }
    } else {
      p.note(
        [
          "Set " +
            color.cyan("ANTHROPIC_API_KEY") +
            " to enable Claude-powered pre-fill from a short description.",
          color.dim(
            "(Optional. You can always answer every question manually.)"
          ),
        ].join("\n"),
        "Tip"
      );
    }
  }

  // Filter to selected depth and run interview
  const filteredQuestions = filterByDepth(questions, depth);

  const saveSnapshot = (snap: ProgressSnapshot) => {
    writeProgress({
      version: 1,
      savedAt: new Date().toISOString(),
      targetDirInput,
      outDir,
      selectedAgents,
      depth,
      answers: snap.answers,
      askedStack: snap.askedStack,
      index: snap.index,
    });
  };

  const answers = await runQuestions(filteredQuestions, {
    defaults,
    resumeState,
    onProgress: saveSnapshot,
  });

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

  // Success — clear saved progress.
  deleteProgressFile();

  const costs = estimateCosts(answers);
  const costLine = costs.freeTierPossible
    ? color.dim("Estimated infra cost: ") +
      color.green("$0–$" + costs.maxTotal + "/mo") +
      color.dim(" (all services have free tiers at MVP scale)")
    : color.dim("Estimated infra cost: ") +
      color.yellow("~$" + costs.minTotal + "–$" + costs.maxTotal + "/mo") +
      color.dim(" at low traffic");

  p.outro(
    [
      color.green("Done!"),
      "",
      color.bold("Files written:"),
      ...writtenPaths.map((f) => `  ${color.dim("•")} ${f}`),
      "",
      costLine,
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
