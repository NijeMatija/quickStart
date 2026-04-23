# quickStart

Turn a product idea into an AI-agent-ready spec in 5 minutes.

`quickstart` is an interactive CLI that asks ~30–70 smart, branching questions about your idea (name, audience, stack, data, features, design, deploy, ops) and writes:

- **`SPEC.md`** — a structured product spec your AI coding agent reads to understand what to build.
- **An instructions file** for the agent(s) you use — `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`, `CONVENTIONS.md`, or a vendor-neutral `AGENTS.md`.

Drop the folder into Claude Code, Cursor, Windsurf, Copilot, Aider, or any other AI coding tool and start building.

## Install

```bash
# One-off use (recommended)
npx quickstart-spec

# Or install globally
npm install -g quickstart-spec
quickstart
```

## Usage

```bash
npx quickstart-spec
```

You'll be asked:

1. Where to write the output (default `./my-new-project`).
2. Which AI coding agent(s) you'll use — choose one or more: Claude Code, Cursor, Windsurf, Copilot, Aider, or the vendor-neutral `AGENTS.md`.
3. (Optional) Whether to pre-fill answers from a short description using Claude — see **Smart pre-fill** below.
4. 10 short sections of branching questions:
   1. **Identity** — name, tagline, audience, problem
   2. **Users & Auth** — accounts, sign-in methods, roles, billing
   3. **Platforms** — web / mobile / desktop / CLI / extension / API
   4. **Stack** — language, frameworks, UI library, testing
   5. **Data** — database, ORM, storage, search, caching
   6. **Core Features** — top features, capability checklist
   7. **Integrations** — LLM, payments, email, analytics, errors
   8. **Design** — aesthetic, color, dark mode, iconography, i18n
   9. **Deploy** — hosting, CI, environments, compliance
   10. **Ops** — logging, monitoring, docs, rate limits

Irrelevant branches are skipped automatically (no DB questions if you said no database, no mobile questions if you said web-only, etc.).

## Smart pre-fill (optional)

If `ANTHROPIC_API_KEY` is set in your environment, quickstart offers to pre-fill answers from a 2–5 sentence description of your project using Claude. You then step through the interview with each question pre-filled — accept, edit, or override as you go.

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npx quickstart-spec
```

Without the key set, quickstart runs in fully manual mode — nothing is sent anywhere.

## Output

Example output when targeting Claude Code + Cursor:

```
my-new-project/
  SPEC.md          # Human + agent readable product spec
  CLAUDE.md        # Claude Code instructions
  .cursorrules     # Cursor instructions
```

| Agent           | File written                        |
| --------------- | ----------------------------------- |
| Claude Code     | `CLAUDE.md`                         |
| Cursor          | `.cursorrules`                      |
| Windsurf        | `.windsurfrules`                    |
| GitHub Copilot  | `.github/copilot-instructions.md`   |
| Aider           | `CONVENTIONS.md`                    |
| Universal       | `AGENTS.md`                         |

### Next step

```bash
cd my-new-project
claude            # or: cursor . / windsurf . / aider, etc.
```

Your agent reads its instructions file, follows the pointer to `SPEC.md`, and starts scaffolding.

## Development

```bash
npm install
npm run dev       # run locally with tsx (no build)
npm run build     # compile TypeScript to dist/
npm start         # run the built CLI
```

## License

MIT
