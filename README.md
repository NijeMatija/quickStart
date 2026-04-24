<div align="center">

# ⚡ quickStart

### Turn a product idea into an AI-agent-ready spec in 5 minutes.

[![npm version](https://img.shields.io/npm/v/quickstart-spec.svg?style=flat-square&color=14b8a6)](https://www.npmjs.com/package/quickstart-spec)
[![node](https://img.shields.io/node/v/quickstart-spec.svg?style=flat-square&color=14b8a6)](https://www.npmjs.com/package/quickstart-spec)
[![license](https://img.shields.io/npm/l/quickstart-spec.svg?style=flat-square&color=14b8a6)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Built for AI coding agents](https://img.shields.io/badge/built%20for-AI%20coding%20agents-9333ea?style=flat-square)](#which-agents-are-supported)
[![Donate via PayPal](https://img.shields.io/badge/donate-PayPal-00457C?style=flat-square&logo=paypal&logoColor=white)](https://paypal.me/NijeMatija)

**Interview → `SPEC.md` + agent instructions → hand it to your coding agent.**

[Quick start](#-quick-start) · [How it works](#-how-it-works) · [Output](#-output) · [FAQ](#-faq)

</div>

---

## ✨ Why?

Every new project starts the same way: you have a vague idea, you open an AI coding agent, and you spend the next 90 minutes ping-ponging about what stack to use, whether you need auth, what the core flows are — before a single file is written.

**quickStart compresses that to a 5-minute interview.** You answer a branching set of questions. It writes a structured spec your agent reads *before* it writes code. Fewer hallucinations. Less rework. Actual focus.

<div align="center">

```
  💡 idea  →  ❓ interview  →  📄 SPEC.md  →  🤖 your agent builds it
```

</div>

## 🚀 Quick start

```bash
npx quickstart-spec
```

That's it. Answer the questions. Drop the folder into Claude Code, Cursor, Windsurf, Copilot, or Aider. Done.

## 🧠 How it works

1. **Pick your agent(s).** Claude Code, Cursor, Windsurf, Copilot, Aider, or a vendor-neutral `AGENTS.md`. Select one or many.
2. *(Optional)* **Smart pre-fill.** If `ANTHROPIC_API_KEY` is set, paste a 2–5 sentence description and Claude drafts the answers for you. You still step through each one — accept, edit, or override.
3. **10-section interview.** Branching questions across Identity, Users & Auth, Platforms, Stack, Data, Core Features, Integrations, Design, Deploy, Ops. Irrelevant sections skip themselves (no DB questions if you said no database; no mobile questions if you said web-only).
4. **Two files get written.** `SPEC.md` (the product spec) and one correctly-named instruction file per agent you selected.

## 📦 Output

A ready-to-commit folder:

```
my-new-project/
├── SPEC.md                    # Structured product spec (the source of truth)
├── CLAUDE.md                  # Claude Code instructions
└── .cursorrules               # Cursor instructions
```

### `SPEC.md` contains

- Overview · audience · problem · success metric
- Approved **tech stack** and design decisions
- Full **feature list** and primary user journey
- **Suggested build order** that adapts to your answers (scaffold → DB → auth → features → deploy)
- **Open Questions** — every "not decided" flagged for your agent to ask about

### Which agents are supported?

| Agent              | File written                         |
| ------------------ | ------------------------------------ |
| 🟣 Claude Code     | `CLAUDE.md`                          |
| ⚫ Cursor          | `.cursorrules`                       |
| 🌊 Windsurf        | `.windsurfrules`                     |
| 🐙 GitHub Copilot  | `.github/copilot-instructions.md`    |
| 🛠️ Aider           | `CONVENTIONS.md`                     |
| 🌐 Universal       | `AGENTS.md` (vendor-neutral)         |

## 🤖 Smart pre-fill (optional)

Set `ANTHROPIC_API_KEY` in your environment and quickStart will offer to bootstrap the interview from a short paragraph:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npx quickstart-spec
```

You describe your project in 2–5 sentences. Claude drafts answers for every question it can confidently answer. You step through each one with the draft as the default — accept, edit, or skip. Typically cuts interview time in half for a clear idea.

Without the key set, quickStart runs fully offline — nothing is sent anywhere.

## 🎯 Next step

```bash
cd my-new-project
claude            # or: cursor . / windsurf . / aider, etc.
```

Your agent reads its instruction file → follows the pointer to `SPEC.md` → starts scaffolding. First task usually comes from the "Suggested Build Order".

## ❓ FAQ

**How long does it take?** 5–10 minutes depending on how many questions you skip. Smart pre-fill cuts it further.

**Do I have to use Claude?** No. Smart pre-fill uses Claude, but the whole interview-and-write-spec flow is 100% offline and works with any agent. Pick whichever agent(s) in the multiselect and it writes the right file(s).

**Can I re-run it on an existing project?** Yes. Point it at the folder and confirm the overwrite. The `Appendix — Raw Answers` in `SPEC.md` stores your previous answers as JSON for reference.

**Can I customize the questions?** Fork the repo and edit `src/questions.ts`. It's a plain array of 100 objects with conditional `skipIf` predicates — easy to extend.

**Does it work on Windows?** Yes. Built on Node 18+; tested on Windows, macOS, and Linux.

## 🛠️ Development

```bash
git clone https://github.com/NijeMatija/quickStart.git
cd quickStart
npm install
npm run dev       # run locally with tsx (no build)
npm run build     # compile TypeScript to dist/
npm start         # run the built CLI
```

## 📜 License

MIT — do whatever you want. Attribution appreciated but not required.

---

<div align="center">

Built with ❤️ and [Claude](https://www.anthropic.com/claude).

If this saved you time, a ⭐ on GitHub would mean a lot —
and if it saved you a *lot* of time, you can [send a tip via PayPal 💙](https://paypal.me/NijeMatija).

</div>
