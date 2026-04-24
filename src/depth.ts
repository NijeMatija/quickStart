import { Question } from "./types.js";

export type Depth = "quick" | "standard" | "deep";

export const DEPTH_OPTIONS = [
  {
    value: "quick" as const,
    label: "Quick  (~20 questions · ~3 min)",
    hint: "Essentials only. Name, stack, features, hosting. Great for prototypes.",
  },
  {
    value: "standard" as const,
    label: "Standard  (~50 questions · ~10 min)",
    hint: "Balanced. Adds auth detail, testing, integrations, deploy settings.",
  },
  {
    value: "deep" as const,
    label: "Deep  (all 100 questions · ~25 min)",
    hint: "Thorough. Every knob — compliance, ops, i18n, retention, the works.",
  },
];

// Questions included in Quick mode.
const QUICK_IDS = new Set<string>([
  // Identity
  "name",
  "tagline",
  "description",
  "audience",
  "problem",
  "projectType",
  // Users & Auth
  "hasAccounts",
  "authMethods",
  // Platforms
  "platforms",
  // Stack
  "languagePref",
  "frontendFramework",
  // Data
  "dbNeeded",
  "dbType",
  // Core Features
  "topFeatures",
  "features",
  "userFlows",
  // Design
  "aesthetic",
  "primaryColor",
  "darkMode",
  // Deploy
  "hosting",
]);

// Questions added on top of Quick for Standard mode.
const STANDARD_EXTRA_IDS = new Set<string>([
  // Identity
  "license",
  "timeline",
  // Users & Auth
  "hasRoles",
  "hasTeams",
  "hasBilling",
  // Platforms
  "primaryPlatform",
  "marketingSite",
  "adminDashboard",
  "publicApi",
  // Stack
  "backendFramework",
  "styling",
  "uiLibrary",
  "testing",
  "packageManager",
  // Data
  "orm",
  "migrations",
  "fileStorage",
  // Core Features
  "sharing",
  "notificationChannels",
  "aiUsage",
  // Integrations
  "llmProvider",
  "paymentProvider",
  "analytics",
  "errorTracking",
  // Design
  "iconSet",
  "accessibility",
  // Deploy
  "dbHosting",
  "cicd",
  "previewDeploys",
  // Ops
  "logging",
  "supportChannel",
]);

export function filterByDepth(questions: Question[], depth: Depth): Question[] {
  if (depth === "deep") return questions;
  if (depth === "quick") return questions.filter((q) => QUICK_IDS.has(q.id));
  return questions.filter(
    (q) => QUICK_IDS.has(q.id) || STANDARD_EXTRA_IDS.has(q.id)
  );
}
