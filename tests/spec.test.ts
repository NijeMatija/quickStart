import { describe, it, expect } from "vitest";
import { generateSpec } from "../src/spec.js";
import type { Answers } from "../src/types.js";

describe("generateSpec", () => {
  const baseAnswers: Answers = {
    name: "TestApp",
    tagline: "A test app",
    description: "Does testing things.",
    audience: "Developers",
    problem: "No tests",
    projectType: "saas-product",
    license: "MIT",
    timeline: "weeks",
    platforms: ["web"],
    languagePref: "typescript",
    frontendFramework: "nextjs",
    backendFramework: "nextjs-routes",
    styling: "tailwind",
    uiLibrary: "shadcn",
    testing: ["vitest"],
    packageManager: "npm",
    monorepo: false,
    codeQuality: ["eslint", "prettier"],
    dbNeeded: true,
    dbType: "postgres",
    orm: "prisma",
    migrations: true,
    seedData: true,
    realtimeSync: false,
    fileStorage: false,
    searchNeeded: false,
    caching: "none",
    topFeatures: "auth, dashboard, api",
    features: ["crud-dashboard"],
    userFlows: "User signs up and sees a dashboard.",
    sharing: false,
    exportImport: false,
    offlineUse: false,
    contentModeration: false,
    emailProvider: "resend",
    analytics: "posthog",
    errorTracking: "sentry",
    cms: "mdx",
    webhooks: [],
    otherApis: "none",
    jobQueue: "none",
    aesthetic: "minimal-flat",
    primaryColor: "#14b8a6",
    darkMode: true,
    density: "comfortable",
    fontFamily: "geometric-sans",
    iconSet: "lucide",
    motion: "subtle",
    accessibility: "wcag-aa",
    i18n: false,
    hosting: "vercel",
    dbHosting: "supabase",
    domainOwned: false,
    cicd: "github-actions",
    environments: "prod-staging",
    previewDeploys: true,
    cdn: true,
    compliance: [],
    uptime: "99",
    secrets: "env-vars",
    logging: "structured",
    monitoring: "none",
    featureFlags: false,
    abTesting: false,
    onboarding: true,
    supportChannel: "email",
    docs: [],
    rateLimiting: true,
    dataRetention: "none",
    forbiddenTech: "none",
    hasAccounts: true,
    authMethods: ["email-password", "google"],
    emailVerification: true,
    passwordReset: true,
    mfa: false,
    hasRoles: true,
    rolesList: "user, admin",
    hasTeams: false,
    hasBilling: false,
    profileFields: "none",
    primaryPlatform: "web",
    marketingSite: true,
    adminDashboard: false,
    responsive: true,
    pwa: false,
    mobileOffline: false,
    sharedCodebase: false,
    publicApi: false,
    embeddable: false,
    fullstackOrSplit: "fullstack",
    notificationChannels: ["in-app", "email"],
    aiUsage: "",
    realtimeFeatures: [],
    llmProvider: "",
    paymentProvider: "",
    pricingModel: "",
    rtl: false,
  };

  it("includes the project name as an H1", () => {
    const spec = generateSpec(baseAnswers);
    expect(spec).toMatch(/^# TestApp/m);
  });

  it("includes the tagline as a blockquote", () => {
    const spec = generateSpec(baseAnswers);
    expect(spec).toMatch(/> A test app/);
  });

  it("includes a Tech Stack section", () => {
    const spec = generateSpec(baseAnswers);
    expect(spec).toContain("## Tech Stack");
    expect(spec).toContain("typescript");
    expect(spec).toContain("nextjs");
  });

  it("includes a Suggested Build Order section", () => {
    const spec = generateSpec(baseAnswers);
    expect(spec).toContain("## Suggested Build Order");
    expect(spec).toContain("Scaffold");
    expect(spec).toContain("Set up the database");
  });

  it("skips database step when dbNeeded is false", () => {
    const answers = { ...baseAnswers, dbNeeded: false };
    const spec = generateSpec(answers);
    expect(spec).toContain("No persistent database");
    expect(spec).not.toMatch(/Set up the database/i);
  });

  it("flags open questions for undecided values", () => {
    const answers = { ...baseAnswers, hosting: "undecided" };
    const spec = generateSpec(answers);
    expect(spec).toContain("## Open Questions");
    expect(spec).toContain("Hosting");
  });

  it("includes the marketing site step when marketingSite is true", () => {
    const spec = generateSpec(baseAnswers);
    expect(spec).toMatch(/Marketing site\.\*\* Landing page, signup CTA/);
  });

  it("includes pricing in marketing site when hasBilling is true", () => {
    const answers = { ...baseAnswers, hasBilling: true, marketingSite: true };
    const spec = generateSpec(answers);
    expect(spec).toMatch(
      /Marketing site\.\*\* Landing page, pricing, signup CTA/
    );
  });

  it("includes raw answers appendix", () => {
    const spec = generateSpec(baseAnswers);
    expect(spec).toContain("## Appendix — Raw Answers");
    expect(spec).toContain('"name": "TestApp"');
  });
});
