# quickStart

Turn a product idea into an AI-agent-ready spec in 5 minutes.

`quickstart` is an interactive CLI that asks ~30–70 smart, branching questions about your idea (name, audience, stack, data, features, design, deploy, ops) and writes two files into a new folder:

- **`SPEC.md`** — a structured product spec your AI coding agent reads to understand what to build.
- **`CLAUDE.md`** — agent-facing instructions that point at the spec and set working conventions.

Drop the folder into Claude Code, Cursor, or any other AI coding tool and start building.

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

You'll be asked where to write the output (default `./my-new-project`) and then walked through 10 short sections:

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

## Output

After answering, you get a folder like:

```
my-new-project/
  SPEC.md       # Human + agent readable product spec
  CLAUDE.md     # Agent working instructions
```

### Next step

```bash
cd my-new-project
claude            # or: cursor .
```

Your agent will read `CLAUDE.md`, follow its pointer to `SPEC.md`, and start scaffolding.

## Development

```bash
npm install
npm run dev       # run locally with tsx (no build)
npm run build     # compile TypeScript to dist/
npm start         # run the built CLI
```

## License

MIT
