import { describe, it, expect } from "vitest";
import { questions } from "../src/questions.js";
import type { Answers } from "../src/types.js";

describe("question skipIf predicates", () => {
  const base: Answers = {
    platforms: ["web"],
    hasAccounts: true,
    authMethods: ["email-password"],
    dbNeeded: true,
    features: ["notifications"],
    realtimeSync: false,
    fileStorage: true,
    hasBilling: true,
    hasRoles: true,
    i18n: false,
    marketingSite: true,
    publicApi: false,
    adminDashboard: true,
  };

  it("skips auth detail questions when hasAccounts is false", () => {
    const authMethods = questions.find((q) => q.id === "authMethods");
    expect(authMethods?.skipIf?.({ ...base, hasAccounts: false })).toBe(true);
    expect(authMethods?.skipIf?.(base)).toBe(false);
  });

  it("skips email verification when no email-password auth", () => {
    const q = questions.find((q) => q.id === "emailVerification");
    expect(q?.skipIf?.({ ...base, authMethods: ["google"] })).toBe(true);
    expect(q?.skipIf?.(base)).toBe(false);
  });

  it("skips db questions when dbNeeded is false", () => {
    const dbType = questions.find((q) => q.id === "dbType");
    expect(dbType?.skipIf?.({ ...base, dbNeeded: false })).toBe(true);
    expect(dbType?.skipIf?.(base)).toBe(false);
  });

  it("skips frontend design questions when no frontend platform", () => {
    const aesthetic = questions.find((q) => q.id === "aesthetic");
    expect(aesthetic?.skipIf?.({ ...base, platforms: ["api-only"] })).toBe(
      true
    );
    expect(aesthetic?.skipIf?.(base)).toBe(false);
  });

  it("skips storage provider when fileStorage is false", () => {
    const q = questions.find((q) => q.id === "storageProvider");
    expect(q?.skipIf?.({ ...base, fileStorage: false })).toBe(true);
    expect(q?.skipIf?.(base)).toBe(false);
  });

  it("skips notification channels when notifications feature not selected", () => {
    const q = questions.find((q) => q.id === "notificationChannels");
    expect(q?.skipIf?.({ ...base, features: ["crud-dashboard"] })).toBe(true);
    expect(q?.skipIf?.(base)).toBe(false);
  });

  it("skips billing questions when hasBilling is false", () => {
    const paymentProvider = questions.find((q) => q.id === "paymentProvider");
    expect(paymentProvider?.skipIf?.({ ...base, hasBilling: false })).toBe(
      true
    );
    expect(paymentProvider?.skipIf?.(base)).toBe(false);
  });

  it("skips primary platform when only one platform selected", () => {
    const q = questions.find((q) => q.id === "primaryPlatform");
    expect(q?.skipIf?.({ ...base, platforms: ["web"] })).toBe(true);
    expect(q?.skipIf?.({ ...base, platforms: ["web", "ios"] })).toBe(false);
  });

  it("skips rtl when i18n is false", () => {
    const q = questions.find((q) => q.id === "rtl");
    expect(q?.skipIf?.({ ...base, i18n: false })).toBe(true);
    expect(q?.skipIf?.({ ...base, i18n: true })).toBe(false);
  });
});
