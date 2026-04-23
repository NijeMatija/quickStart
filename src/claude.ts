import { Answers } from "./types.js";

const get = (a: Answers, id: string, fallback = ""): string => {
  const v = a[id];
  if (v === undefined || v === null || v === "") return fallback;
  if (Array.isArray(v)) return v.length ? v.join(", ") : fallback;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};
const bool = (a: Answers, id: string) => a[id] === true;

export function generateClaudeMd(a: Answers): string {
  const name = get(a, "name", "this project");
  const tagline = get(a, "tagline");
  const stackSummary = [
    get(a, "languagePref"),
    get(a, "frontendFramework"),
    get(a, "backendFramework"),
    bool(a, "dbNeeded") ? `${get(a, "dbType")}${get(a, "orm") ? " + " + get(a, "orm") : ""}` : "",
    get(a, "uiLibrary"),
    get(a, "styling"),
  ]
    .filter((s) => s && s !== "no-pref")
    .join(" · ");

  const firstTask = bool(a, "dbNeeded")
    ? `Scaffold the app with ${get(a, "frontendFramework") || "the chosen framework"}, wire up ${get(a, "dbType")} + ${get(a, "orm")}, and define the first schema.`
    : `Scaffold the app with ${get(a, "frontendFramework") || "the chosen framework"} and set up the basic project structure.`;

  return `# CLAUDE.md

This file guides AI coding agents (Claude Code, Cursor, etc.) working on **${name}**${tagline ? ` — ${tagline}` : ""}.

## Source of Truth

**Read [SPEC.md](./SPEC.md) first.** It defines:

- What the product is and who it's for
- The approved tech stack and design decisions
- The full feature list and user flows
- A suggested build order

When anything here conflicts with SPEC.md, SPEC.md wins.

## Stack at a Glance

${stackSummary || "_See SPEC.md \"Tech Stack\" section._"}

${bool(a, "dbNeeded") ? `Database: ${get(a, "dbType")}${get(a, "dbHosting") && get(a, "dbHosting") !== "undecided" ? ` on ${get(a, "dbHosting")}` : ""}.` : "No database."}
${get(a, "hosting") && get(a, "hosting") !== "undecided" ? `Hosting: ${get(a, "hosting")}.` : ""}
${get(a, "testing") ? `Testing: ${get(a, "testing")}.` : ""}

## Your First Task

The repo contains only \`SPEC.md\` and this file. **${firstTask}**

Then work through the "Suggested Build Order" in SPEC.md — one step at a time, shipping the happy path for each before moving on.

## Working Conventions

- **Stick to the spec.** Don't introduce frameworks, services, or architectural patterns the spec didn't ask for.
- **Simplicity first.** Make the smallest change that satisfies the requirement. Three similar lines beats a premature abstraction.
- **No speculative work.** Don't add error handling, feature flags, or compatibility shims for scenarios the spec doesn't mention.
- **Default to no comments.** Let well-named identifiers speak. Only comment when the *why* is non-obvious (subtle invariant, workaround, hidden constraint).
- **Ask before deviating.** If the spec leaves a choice as "no preference" or "undecided", propose 1–2 options before implementing.
${bool(a, "hasAccounts") ? "- **Auth is real.** Treat auth like production from day one: never log credentials, always verify on the server, use HTTP-only cookies for sessions." : ""}
${get(a, "forbiddenTech") && get(a, "forbiddenTech") !== "none" ? `- **Do not use:** ${get(a, "forbiddenTech")}.` : ""}

## Verifying Your Work

Before marking anything as done:

1. The feature works end-to-end (not just the unit).
2. No TypeScript errors / lint errors.
3. ${get(a, "testing") && !String(a.testing).includes("none") ? "Relevant tests pass." : "Manual check of the happy path."}
4. Touched UI actually looks right${bool(a, "darkMode") ? " in both light and dark mode" : ""}.

## When You're Stuck

- Re-read the relevant SPEC.md section.
- If the spec is ambiguous, ask the user — don't guess on load-bearing decisions.
- If a choice seems hacky, pause and propose the elegant version before implementing.
`;
}
