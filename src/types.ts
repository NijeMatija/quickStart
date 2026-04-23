export type Answers = Record<string, unknown>;

export type QuestionType = "text" | "confirm" | "select" | "multiselect";

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

export interface Question {
  id: string;
  category: string;
  type: QuestionType;
  label: string;
  hint?: string;
  options?: SelectOption[];
  defaultValue?: unknown;
  placeholder?: string;
  required?: boolean;
  skipIf?: (answers: Answers) => boolean;
  validate?: (value: string) => string | undefined;
}

export const CATEGORIES = [
  "Identity",
  "Users & Auth",
  "Platforms",
  "Stack",
  "Data",
  "Core Features",
  "Integrations",
  "Design",
  "Deploy",
  "Ops",
] as const;

export type Category = (typeof CATEGORIES)[number];
