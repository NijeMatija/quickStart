import { describe, it, expect } from "vitest";
import { estimateCosts, formatCostEstimate } from "../src/pricing.js";
import type { Answers } from "../src/types.js";

describe("estimateCosts", () => {
  it("returns not-decided item when nothing is selected", () => {
    const est = estimateCosts({});
    expect(est.items.length).toBe(1);
    expect(est.items[0].service).toBe("Hosting");
    expect(est.items[0].note).toBe("Not decided");
    expect(est.minTotal).toBe(0);
    expect(est.maxTotal).toBe(0);
    expect(est.freeTierPossible).toBe(true);
  });

  it("estimates Vercel + Supabase + Sentry stack", () => {
    const answers: Answers = {
      hosting: "vercel",
      dbNeeded: true,
      dbHosting: "supabase",
      errorTracking: "sentry",
      analytics: "posthog",
      emailProvider: "resend",
      caching: "none",
      jobQueue: "none",
    };
    const est = estimateCosts(answers);
    expect(est.items.some((i) => i.service === "Vercel")).toBe(true);
    expect(est.items.some((i) => i.service === "Supabase")).toBe(true);
    expect(est.items.some((i) => i.service === "Sentry")).toBe(true);
    expect(est.items.some((i) => i.service === "PostHog")).toBe(true);
    expect(est.items.some((i) => i.service === "Resend")).toBe(true);
    expect(est.freeTierPossible).toBe(true);
  });

  it("flags when free tier is not possible (PlanetScale)", () => {
    const answers: Answers = {
      hosting: "vercel",
      dbNeeded: true,
      dbHosting: "planetscale",
      errorTracking: "sentry",
    };
    const est = estimateCosts(answers);
    expect(est.freeTierPossible).toBe(false);
    expect(est.minTotal).toBeGreaterThan(0);
  });

  it("includes storage costs when fileStorage is true", () => {
    const answers: Answers = {
      fileStorage: true,
      storageProvider: "s3",
    };
    const est = estimateCosts(answers);
    expect(est.items.some((i) => i.service === "AWS S3")).toBe(true);
  });

  it("skips database when dbNeeded is false", () => {
    const answers: Answers = {
      dbNeeded: false,
      dbHosting: "supabase",
    };
    const est = estimateCosts(answers);
    expect(est.items.some((i) => i.category === "Database")).toBe(false);
  });

  it("includes payment processor note as $0 fixed cost", () => {
    const answers: Answers = {
      hasBilling: true,
      paymentProvider: "stripe",
    };
    const est = estimateCosts(answers);
    const stripe = est.items.find((i) => i.service === "Stripe");
    expect(stripe).toBeDefined();
    expect(stripe!.min).toBe(0);
    expect(stripe!.max).toBe(0);
    expect(stripe!.note).toContain("2.9%");
  });
});

describe("formatCostEstimate", () => {
  it("formats a free-tier-possible estimate", () => {
    const est = estimateCosts({
      hosting: "vercel",
      dbNeeded: true,
      dbHosting: "supabase",
      analytics: "posthog",
    });
    const formatted = formatCostEstimate(est);
    expect(formatted).toContain("Monthly Cost Estimate");
    expect(formatted).toContain("Free");
    expect(formatted).toContain("$0");
  });

  it("formats a paid-only estimate", () => {
    const est = estimateCosts({
      hosting: "railway",
      dbNeeded: true,
      dbHosting: "planetscale",
    });
    const formatted = formatCostEstimate(est);
    expect(formatted).toContain("Monthly Cost Estimate");
    expect(formatted).toContain("PlanetScale");
    expect(formatted).toContain("$39/mo");
  });
});
