import Anthropic from "@anthropic-ai/sdk";
import { Answers, Question } from "./types.js";

const MODEL = "claude-opus-4-7";

export interface SmartFillResult {
  answers: Answers;
  filledCount: number;
  skippedKeys: string[];
  rawText: string;
}

export class SmartFillError extends Error {}

function buildQuestionCatalog(questions: Question[]): string {
  return questions
    .map((q) => {
      const parts: string[] = [];
      parts.push(`- id: ${q.id}`);
      parts.push(`  category: ${q.category}`);
      parts.push(`  type: ${q.type}`);
      parts.push(`  label: ${q.label}`);
      if (q.hint) parts.push(`  hint: ${q.hint}`);
      if (q.options?.length) {
        const opts = q.options.map((o) => o.value).join(", ");
        parts.push(`  options: [${opts}]`);
      }
      return parts.join("\n");
    })
    .join("\n\n");
}

function sanitize(
  raw: Record<string, unknown>,
  questions: Question[]
): { answers: Answers; skipped: string[] } {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const answers: Answers = {};
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(raw)) {
    const q = byId.get(key);
    if (!q) {
      skipped.push(`${key} (unknown id)`);
      continue;
    }
    if (value === null || value === undefined || value === "") continue;

    switch (q.type) {
      case "text": {
        if (typeof value === "string" && value.trim()) {
          answers[key] = value.trim();
        } else {
          skipped.push(`${key} (expected string)`);
        }
        break;
      }
      case "confirm": {
        if (typeof value === "boolean") answers[key] = value;
        else if (value === "yes" || value === "true") answers[key] = true;
        else if (value === "no" || value === "false") answers[key] = false;
        else skipped.push(`${key} (expected boolean)`);
        break;
      }
      case "select": {
        if (typeof value !== "string") {
          skipped.push(`${key} (expected string)`);
          break;
        }
        const allowed = new Set((q.options ?? []).map((o) => o.value));
        if (allowed.has(value)) answers[key] = value;
        else skipped.push(`${key} (value "${value}" not in options)`);
        break;
      }
      case "multiselect": {
        if (!Array.isArray(value)) {
          skipped.push(`${key} (expected array)`);
          break;
        }
        const allowed = new Set((q.options ?? []).map((o) => o.value));
        const clean = value.filter(
          (v): v is string => typeof v === "string" && allowed.has(v)
        );
        if (clean.length) answers[key] = clean;
        else skipped.push(`${key} (no valid options matched)`);
        break;
      }
    }
  }

  return { answers, skipped };
}

function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    throw new SmartFillError("Model returned non-object JSON");
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const inner = JSON.parse(candidate.slice(start, end + 1));
        if (inner && typeof inner === "object" && !Array.isArray(inner)) {
          return inner as Record<string, unknown>;
        }
      } catch {
        /* fall through */
      }
    }
    throw new SmartFillError("Could not parse JSON from model response");
  }
}

export async function smartFill(
  description: string,
  questions: Question[],
  opts: { apiKey?: string } = {}
): Promise<SmartFillResult> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new SmartFillError("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });

  const system = [
    "You turn a short project description into pre-filled answers for an interactive project-spec interview.",
    "",
    "Rules:",
    "- Respond with a SINGLE JSON object. No prose, no markdown fences.",
    "- Keys must be question ids from the catalog below. Skip any question you cannot confidently answer.",
    "- For select questions, the value MUST be one of the listed option values.",
    "- For multiselect, the value MUST be a JSON array of option values.",
    "- For confirm, the value MUST be true or false.",
    "- For text, keep values short (one line) unless the question clearly asks for prose.",
    "- Do not guess. When in doubt, omit the key — the user will be asked interactively.",
    "",
    "Question catalog:",
    buildQuestionCatalog(questions),
  ].join("\n");

  let message;
  try {
    message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system,
      messages: [
        {
          role: "user",
          content: `Project description:\n\n${description}\n\nReturn the JSON object now.`,
        },
      ],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      throw new SmartFillError("Invalid ANTHROPIC_API_KEY");
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new SmartFillError(
        "Rate-limited by Anthropic API — try again shortly"
      );
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new SmartFillError("Network error talking to Anthropic API");
    }
    throw new SmartFillError(
      err instanceof Error ? err.message : "Unknown Anthropic API error"
    );
  }

  const textBlock = message.content.find((b) => b.type === "text");
  const rawText = textBlock && textBlock.type === "text" ? textBlock.text : "";
  if (!rawText) throw new SmartFillError("Model returned no text content");

  const raw = extractJson(rawText);
  const { answers, skipped } = sanitize(raw, questions);

  return {
    answers,
    filledCount: Object.keys(answers).length,
    skippedKeys: skipped,
    rawText,
  };
}
