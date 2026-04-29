import { Answers } from "./types.js";
import { estimateCosts, formatCostEstimate } from "./pricing.js";

const get = (a: Answers, id: string, fallback = ""): string => {
  const v = a[id];
  if (v === undefined || v === null || v === "") return fallback;
  if (Array.isArray(v)) return v.length ? v.join(", ") : fallback;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

const bool = (a: Answers, id: string) => a[id] === true;
const skipped = (a: Answers, id: string) => !(id in a);

const bullet = (label: string, value: string) =>
  value ? `- **${label}:** ${value}` : "";

const section = (title: string, lines: string[]) => {
  const filtered = lines.filter(Boolean);
  if (!filtered.length) return "";
  return `## ${title}\n\n${filtered.join("\n")}\n`;
};

export function generateSpec(a: Answers): string {
  const name = get(a, "name", "Untitled Project");
  const tagline = get(a, "tagline");
  const description = get(a, "description");

  const parts: string[] = [];

  parts.push(`# ${name}\n`);
  if (tagline) parts.push(`> ${tagline}\n`);
  if (description) parts.push(`${description}\n`);

  parts.push(
    section("Overview", [
      bullet("Audience", get(a, "audience")),
      bullet("Problem", get(a, "problem")),
      bullet("Motivation", get(a, "motivation")),
      bullet("Project type", get(a, "projectType")),
      bullet("License", get(a, "license")),
      bullet("Timeline", get(a, "timeline")),
      bullet("Success metric", get(a, "successMetric")),
    ])
  );

  parts.push(
    section("Platforms", [
      bullet("Targets", get(a, "platforms")),
      bullet("Primary platform", get(a, "primaryPlatform")),
      bullet("Public marketing site", get(a, "marketingSite")),
      bullet("Admin dashboard", get(a, "adminDashboard")),
      bullet("Mobile-responsive web", get(a, "responsive")),
      bullet("PWA / installable", get(a, "pwa")),
      bullet("Mobile offline mode", get(a, "mobileOffline")),
      bullet("Shared codebase across platforms", get(a, "sharedCodebase")),
      bullet("Public API for third parties", get(a, "publicApi")),
      bullet("Embeddable widget", get(a, "embeddable")),
    ])
  );

  const authLines = bool(a, "hasAccounts")
    ? [
        bullet("User accounts", "Yes"),
        bullet("Sign-in methods", get(a, "authMethods")),
        bullet("Email verification", get(a, "emailVerification")),
        bullet("Password reset", get(a, "passwordReset")),
        bullet("MFA", get(a, "mfa")),
        bullet(
          "Roles",
          bool(a, "hasRoles") ? get(a, "rolesList", "Yes") : "No"
        ),
        bullet("Teams / workspaces", get(a, "hasTeams")),
        bullet("Billing / subscriptions", get(a, "hasBilling")),
        bullet("Extra profile fields", get(a, "profileFields")),
      ]
    : [bullet("User accounts", "No — app does not require sign-in")];
  parts.push(section("Users & Auth", authLines));

  parts.push(
    section("Tech Stack", [
      bullet("Language", get(a, "languagePref")),
      bullet("Frontend framework", get(a, "frontendFramework")),
      bullet("Backend framework", get(a, "backendFramework")),
      bullet("Architecture", get(a, "fullstackOrSplit")),
      bullet("Styling", get(a, "styling")),
      bullet("UI library", get(a, "uiLibrary")),
      bullet("Testing", get(a, "testing")),
      bullet("Package manager", get(a, "packageManager")),
      bullet("Monorepo", get(a, "monorepo")),
      bullet("Code quality", get(a, "codeQuality")),
    ])
  );

  const dataLines = bool(a, "dbNeeded")
    ? [
        bullet("Database", get(a, "dbType")),
        bullet("ORM", get(a, "orm")),
        bullet("Migrations tooling", get(a, "migrations")),
        bullet("Seed script", get(a, "seedData")),
        bullet("Real-time sync", get(a, "realtimeSync")),
        bullet(
          "File storage",
          bool(a, "fileStorage") ? get(a, "storageProvider", "Yes") : "No"
        ),
        bullet("Full-text / semantic search", get(a, "searchNeeded")),
        bullet("Caching", get(a, "caching")),
      ]
    : [
        bullet("Database", "No persistent database"),
        bullet(
          "File storage",
          bool(a, "fileStorage") ? get(a, "storageProvider", "Yes") : "No"
        ),
      ];
  parts.push(section("Data", dataLines));

  parts.push(
    section("Core Features", [
      bullet("Must-have features", get(a, "topFeatures")),
      bullet("Capabilities", get(a, "features")),
      bullet("Primary user journey", get(a, "userFlows")),
      bullet("Public sharing", get(a, "sharing")),
      bullet("Import / export", get(a, "exportImport")),
      bullet("Notification channels", get(a, "notificationChannels")),
      bullet("AI usage", get(a, "aiUsage")),
      bullet("Real-time features", get(a, "realtimeFeatures")),
      bullet("Offline usage", get(a, "offlineUse")),
      bullet("Content moderation", get(a, "contentModeration")),
    ])
  );

  parts.push(
    section("Integrations", [
      bullet("LLM provider", get(a, "llmProvider")),
      bullet("Payments", get(a, "paymentProvider")),
      bullet("Pricing model", get(a, "pricingModel")),
      bullet("Email", get(a, "emailProvider")),
      bullet("Analytics", get(a, "analytics")),
      bullet("Error tracking", get(a, "errorTracking")),
      bullet("CMS", get(a, "cms")),
      bullet("Webhooks", get(a, "webhooks")),
      bullet("Other third-party APIs", get(a, "otherApis")),
      bullet("Job queue", get(a, "jobQueue")),
    ])
  );

  parts.push(
    section("Design", [
      bullet("Aesthetic", get(a, "aesthetic")),
      bullet("Primary color", get(a, "primaryColor")),
      bullet("Dark mode", get(a, "darkMode")),
      bullet("Density", get(a, "density")),
      bullet("Typography", get(a, "fontFamily")),
      bullet("Icon set", get(a, "iconSet")),
      bullet("Motion", get(a, "motion")),
      bullet("Accessibility target", get(a, "accessibility")),
      bullet(
        "Internationalization",
        bool(a, "i18n") ? `Yes${bool(a, "rtl") ? " (incl. RTL)" : ""}` : "No"
      ),
    ])
  );

  parts.push(
    section("Deployment", [
      bullet("App hosting", get(a, "hosting")),
      bullet("Database hosting", get(a, "dbHosting")),
      bullet("Domain owned", get(a, "domainOwned")),
      bullet("CI / CD", get(a, "cicd")),
      bullet("Environments", get(a, "environments")),
      bullet("Preview deployments", get(a, "previewDeploys")),
      bullet("CDN / edge", get(a, "cdn")),
      bullet("Compliance", get(a, "compliance")),
      bullet("Uptime target", get(a, "uptime")),
      bullet("Secrets management", get(a, "secrets")),
    ])
  );

  parts.push(
    section("Operations", [
      bullet("Logging", get(a, "logging")),
      bullet("Monitoring", get(a, "monitoring")),
      bullet("Feature flags", get(a, "featureFlags")),
      bullet("A/B testing", get(a, "abTesting")),
      bullet("Onboarding flow", get(a, "onboarding")),
      bullet("Support channel", get(a, "supportChannel")),
      bullet("Docs sites", get(a, "docs")),
      bullet("Rate limiting", get(a, "rateLimiting")),
      bullet("Data retention policy", get(a, "dataRetention")),
      bullet("Technologies to avoid", get(a, "forbiddenTech")),
    ])
  );

  parts.push(buildOrder(a));
  parts.push(formatCostEstimate(estimateCosts(a)));
  parts.push(openQuestions(a));
  parts.push(appendix(a));

  return parts.filter(Boolean).join("\n").trim() + "\n";
}

function buildOrder(a: Answers): string {
  const steps: string[] = [];
  let n = 1;

  const stack = [
    get(a, "frontendFramework"),
    get(a, "backendFramework"),
    get(a, "languagePref"),
  ]
    .filter((s) => s && s !== "no-pref")
    .join(" + ");
  steps.push(
    `${n++}. **Scaffold** the project${stack ? ` using ${stack}` : ""}. Configure ${get(a, "packageManager") || "package manager"}, ${get(a, "codeQuality") || "linting"}, and TypeScript.`
  );

  if (bool(a, "dbNeeded")) {
    const dbBits = [get(a, "dbType"), get(a, "orm")]
      .filter((s) => s && s !== "no-pref")
      .join(" + ");
    steps.push(
      `${n++}. **Set up the database** (${dbBits || "per spec"}). Define schema for the core entities, run initial migration${bool(a, "seedData") ? ", seed dev data" : ""}.`
    );
  }

  if (bool(a, "hasAccounts")) {
    const methods = get(a, "authMethods", "email + password");
    steps.push(
      `${n++}. **Authentication.** Implement sign-up / sign-in with ${methods}${bool(a, "hasRoles") ? `, roles (${get(a, "rolesList")})` : ""}${bool(a, "hasTeams") ? ", and team/workspace support" : ""}.`
    );
  }

  const topFeatures = get(a, "topFeatures");
  if (topFeatures) {
    steps.push(
      `${n++}. **Core features.** Build the must-haves one at a time: ${topFeatures}. Ship the happy path for each before polishing.`
    );
  }

  if (bool(a, "adminDashboard")) {
    steps.push(
      `${n++}. **Admin dashboard.** Internal tool for ops / moderation — can be gated behind an admin role.`
    );
  }

  if (bool(a, "hasBilling")) {
    steps.push(
      `${n++}. **Billing.** Integrate ${get(a, "paymentProvider", "payments")} with a ${get(a, "pricingModel", "pricing model")} plan structure.`
    );
  }

  const integ = [
    get(a, "emailProvider"),
    get(a, "analytics"),
    get(a, "errorTracking"),
  ].filter((v) => v && v !== "none");
  if (integ.length) {
    steps.push(`${n++}. **Integrations.** Wire up ${integ.join(", ")}.`);
  }

  if (bool(a, "marketingSite")) {
    steps.push(
      `${n++}. **Marketing site.** Landing page${bool(a, "hasBilling") ? ", pricing" : ""}, signup CTA.`
    );
  }

  const hosting = get(a, "hosting");
  if (hosting && hosting !== "undecided") {
    steps.push(
      `${n++}. **Deploy.** ${hosting}${bool(a, "previewDeploys") ? " with PR preview deployments" : ""}. Set up ${get(a, "environments", "prod")} environments.`
    );
  }

  if (get(a, "docs")) {
    steps.push(`${n++}. **Docs.** ${get(a, "docs")}.`);
  }

  return section(
    "Suggested Build Order",
    steps.length ? [steps.join("\n")] : []
  );
}

function openQuestions(a: Answers): string {
  const qs: string[] = [];
  const check = (id: string, label: string) => {
    const v = a[id];
    if (v === "no-pref" || v === "undecided" || v === "later") {
      qs.push(
        `- **${label}** — not decided. Agent should propose 1–2 options before implementing.`
      );
    }
  };
  check("languagePref", "Language");
  check("frontendFramework", "Frontend framework");
  check("backendFramework", "Backend framework");
  check("packageManager", "Package manager");
  check("dbType", "Database");
  check("orm", "ORM");
  check("uiLibrary", "UI library");
  check("styling", "CSS approach");
  check("fontFamily", "Typography");
  check("iconSet", "Icon set");
  check("hosting", "Hosting");
  check("dbHosting", "Database hosting");
  check("secrets", "Secrets management");
  check("logging", "Logging");

  if (skipped(a, "motivation") || !get(a, "motivation")) {
    qs.push(
      `- **Motivation** — not captured. Optional context; skip unless user asks.`
    );
  }

  return section("Open Questions", qs);
}

function appendix(a: Answers): string {
  const json = JSON.stringify(a, null, 2);
  return `## Appendix — Raw Answers\n\n<details>\n<summary>All answers as JSON (for re-running or post-processing)</summary>\n\n\`\`\`json\n${json}\n\`\`\`\n\n</details>\n`;
}
