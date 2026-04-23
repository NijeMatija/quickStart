export type AgentTarget =
  | "claude-code"
  | "cursor"
  | "windsurf"
  | "copilot"
  | "aider"
  | "universal";

export interface AgentMeta {
  name: string;
  filePath: string;
  description: string;
}

export const AGENT_META: Record<AgentTarget, AgentMeta> = {
  "claude-code": {
    name: "Claude Code",
    filePath: "CLAUDE.md",
    description: "Anthropic's official CLI coding agent",
  },
  cursor: {
    name: "Cursor",
    filePath: ".cursorrules",
    description: "Cursor editor AI rules file",
  },
  windsurf: {
    name: "Windsurf",
    filePath: ".windsurfrules",
    description: "Codeium Windsurf editor rules",
  },
  copilot: {
    name: "GitHub Copilot",
    filePath: ".github/copilot-instructions.md",
    description: "Copilot workspace instructions",
  },
  aider: {
    name: "Aider",
    filePath: "CONVENTIONS.md",
    description: "Aider's conventions file (pass via --read)",
  },
  universal: {
    name: "Universal (AGENTS.md)",
    filePath: "AGENTS.md",
    description: "Vendor-neutral agents file (works with many tools)",
  },
};

export const AGENT_OPTIONS = (Object.keys(AGENT_META) as AgentTarget[]).map(
  (key) => ({
    value: key,
    label: AGENT_META[key].name,
    hint: AGENT_META[key].description,
  })
);
