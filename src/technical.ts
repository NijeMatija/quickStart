import { Answers, Question } from "./types.js";

export type TechnicalLevel = "nontechnical" | "guided" | "technical";

export const TECHNICAL_LEVEL_OPTIONS = [
  {
    value: "nontechnical" as const,
    label: "Non-technical",
    hint: "Plain product questions. Your agent chooses the implementation details.",
  },
  {
    value: "guided" as const,
    label: "Somewhat technical",
    hint: "Balanced. Ask common product and stack decisions.",
  },
  {
    value: "technical" as const,
    label: "Technical",
    hint: "Ask the full selected interview, including stack, deploy, and ops choices.",
  },
];

const NONTECHNICAL_SKIP_IDS = new Set([
  "languagePref",
  "frontendFramework",
  "backendFramework",
  "fullstackOrSplit",
  "styling",
  "uiLibrary",
  "testing",
  "packageManager",
  "monorepo",
  "codeQuality",
  "dbType",
  "orm",
  "migrations",
  "seedData",
  "realtimeSync",
  "storageProvider",
  "searchNeeded",
  "caching",
  "llmProvider",
  "paymentProvider",
  "emailProvider",
  "analytics",
  "errorTracking",
  "cms",
  "webhooks",
  "jobQueue",
  "fontFamily",
  "iconSet",
  "motion",
  "accessibility",
  "hosting",
  "dbHosting",
  "cicd",
  "environments",
  "previewDeploys",
  "cdn",
  "uptime",
  "secrets",
  "logging",
  "monitoring",
  "featureFlags",
  "abTesting",
  "rateLimiting",
  "forbiddenTech",
]);

const NONTECHNICAL_DEFAULTS: Answers = {
  languagePref: "no-pref",
  frontendFramework: "no-pref",
  backendFramework: "no-pref",
  fullstackOrSplit: "no-pref",
  styling: "no-pref",
  uiLibrary: "no-pref",
  testing: ["none-mvp"],
  packageManager: "no-pref",
  monorepo: false,
  codeQuality: [],
  dbType: "no-pref",
  orm: "no-pref",
  migrations: true,
  seedData: true,
  realtimeSync: false,
  searchNeeded: false,
  caching: "none",
  storageProvider: "no-pref",
  llmProvider: "no-pref",
  paymentProvider: "no-pref",
  analytics: "none",
  errorTracking: "none",
  cms: "none",
  webhooks: [],
  jobQueue: "none",
  fontFamily: "no-pref",
  iconSet: "no-pref",
  hosting: "undecided",
  dbHosting: "undecided",
  secrets: "undecided",
  logging: "later",
  monitoring: "none",
  featureFlags: false,
  abTesting: false,
  rateLimiting: true,
  forbiddenTech: "none",
};

export function normalizeTechnicalLevel(value: unknown): TechnicalLevel {
  return value === "nontechnical" || value === "technical" ? value : "guided";
}

export function defaultsForTechnicalLevel(level: TechnicalLevel): Answers {
  return level === "nontechnical"
    ? { technicalLevel: level, ...NONTECHNICAL_DEFAULTS }
    : { technicalLevel: level };
}

export function filterByTechnicalLevel(
  questions: Question[],
  level: TechnicalLevel
): Question[] {
  if (level !== "nontechnical") return questions;
  return questions.filter((q) => !NONTECHNICAL_SKIP_IDS.has(q.id));
}
