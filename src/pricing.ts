import { Answers } from "./types.js";

const get = (a: Answers, id: string): string | string[] | undefined =>
  a[id] as string | string[] | undefined;
const bool = (a: Answers, id: string) => a[id] === true;

export interface CostLineItem {
  service: string;
  category: string;
  min: number;
  max: number;
  note: string;
}

export interface CostEstimate {
  items: CostLineItem[];
  minTotal: number;
  maxTotal: number;
  freeTierPossible: boolean;
}

function add(
  items: CostLineItem[],
  service: string,
  category: string,
  min: number,
  max: number,
  note: string
) {
  items.push({ service, category, min, max, note });
}

export function estimateCosts(a: Answers): CostEstimate {
  const items: CostLineItem[] = [];

  // ── Hosting ──
  const hosting = get(a, "hosting") as string | undefined;
  switch (hosting) {
    case "vercel":
      add(
        items,
        "Vercel",
        "Hosting",
        0,
        20,
        "Hobby free for non-commercial; Pro $20/mo + usage"
      );
      break;
    case "netlify":
      add(items, "Netlify", "Hosting", 0, 19, "Starter free; Pro $19/mo");
      break;
    case "cloudflare":
      add(
        items,
        "Cloudflare Pages/Workers",
        "Hosting",
        0,
        5,
        "Free tier generous; Workers Paid $5/mo"
      );
      break;
    case "railway":
      add(items, "Railway", "Hosting", 5, 20, "Hobby $5/mo; Pro $20/mo");
      break;
    case "fly":
      add(items, "Fly.io", "Hosting", 2, 5, "~$2–5/mo for small apps");
      break;
    case "render":
      add(items, "Render", "Hosting", 0, 25, "Starter free; Standard $25/mo");
      break;
    case "aws":
      add(
        items,
        "AWS (ECS/Lambda)",
        "Hosting",
        10,
        50,
        "Variable; ~$10–50/mo at low traffic"
      );
      break;
    case "self-host":
      add(
        items,
        "VPS / Self-host",
        "Hosting",
        5,
        20,
        "~$5–20/mo (Hetzner, DigitalOcean, etc.)"
      );
      break;
    default:
      add(items, "Hosting", "Hosting", 0, 0, "Not decided");
  }

  // ── Database ──
  if (bool(a, "dbNeeded")) {
    const dbHosting = get(a, "dbHosting") as string | undefined;
    switch (dbHosting) {
      case "supabase":
        add(
          items,
          "Supabase",
          "Database",
          0,
          25,
          "Free tier strong; Pro $25/mo"
        );
        break;
      case "neon":
        add(
          items,
          "Neon",
          "Database",
          0,
          20,
          "Free tier available; Launch ~$0–20/mo usage-based"
        );
        break;
      case "planetscale":
        add(
          items,
          "PlanetScale",
          "Database",
          39,
          39,
          "Scaler $39/mo (no free tier)"
        );
        break;
      case "railway":
        add(items, "Railway Postgres", "Database", 5, 20, "~$5–20/mo");
        break;
      case "rds":
        add(items, "AWS RDS", "Database", 13, 30, "~$13–30/mo for db.t3.micro");
        break;
      case "self-host":
        add(items, "Self-hosted DB", "Database", 0, 0, "$0 (runs on your VPS)");
        break;
      default:
        add(items, "Database hosting", "Database", 0, 0, "Not decided");
    }
  }

  // ── File Storage ──
  if (bool(a, "fileStorage")) {
    const provider = get(a, "storageProvider") as string | undefined;
    switch (provider) {
      case "s3":
        add(
          items,
          "AWS S3",
          "Storage",
          0,
          5,
          "~$0.023/GB; usually pennies at MVP scale"
        );
        break;
      case "r2":
        add(
          items,
          "Cloudflare R2",
          "Storage",
          0,
          0,
          "Free egress; ~$0.015/GB storage"
        );
        break;
      case "supabase":
        add(
          items,
          "Supabase Storage",
          "Storage",
          0,
          5,
          "1 GB free; ~$0.021/GB after"
        );
        break;
      case "gcs":
        add(items, "Google Cloud Storage", "Storage", 0, 5, "~$0.02/GB");
        break;
      case "uploadthing":
        add(items, "UploadThing", "Storage", 0, 10, "Free tier; then ~$10/mo");
        break;
      case "local":
        add(items, "Local filesystem", "Storage", 0, 0, "$0 (dev only)");
        break;
      default:
        add(items, "File storage", "Storage", 0, 5, "Not decided");
    }
  }

  // ── Email ──
  const email = get(a, "emailProvider") as string | undefined;
  if (email && email !== "none") {
    switch (email) {
      case "resend":
        add(items, "Resend", "Email", 0, 20, "Free 3k emails/mo; then $20/mo");
        break;
      case "postmark":
        add(items, "Postmark", "Email", 15, 15, "$15/mo for 10k emails");
        break;
      case "sendgrid":
        add(
          items,
          "SendGrid",
          "Email",
          0,
          20,
          "Free 100/day; Essentials ~$20/mo"
        );
        break;
      case "ses":
        add(items, "AWS SES", "Email", 0, 1, "~$0.10 per 1k emails");
        break;
      case "loops":
        add(
          items,
          "Loops",
          "Email",
          0,
          10,
          "Free tier available; paid from ~$10/mo"
        );
        break;
    }
  }

  // ── Analytics ──
  const analytics = get(a, "analytics") as string | undefined;
  if (analytics && analytics !== "none") {
    switch (analytics) {
      case "posthog":
        add(
          items,
          "PostHog",
          "Analytics",
          0,
          0,
          "Free 1M events/mo — generous for MVPs"
        );
        break;
      case "plausible":
        add(items, "Plausible", "Analytics", 9, 9, "$9/mo");
        break;
      case "umami":
        add(
          items,
          "Umami",
          "Analytics",
          0,
          20,
          "Self-host free; Cloud ~$20/mo"
        );
        break;
      case "ga4":
        add(items, "Google Analytics 4", "Analytics", 0, 0, "Free");
        break;
      case "mixpanel":
        add(
          items,
          "Mixpanel",
          "Analytics",
          0,
          28,
          "Free 20M users/mo; then ~$28/mo"
        );
        break;
    }
  }

  // ── Error Tracking ──
  const errorTracking = get(a, "errorTracking") as string | undefined;
  if (errorTracking && errorTracking !== "none") {
    switch (errorTracking) {
      case "sentry":
        add(
          items,
          "Sentry",
          "Observability",
          0,
          26,
          "Free 5k errors/mo; Team $26/mo"
        );
        break;
      case "rollbar":
        add(
          items,
          "Rollbar",
          "Observability",
          0,
          13,
          "Free 5k events/mo; Essentials $13/mo"
        );
        break;
      case "bugsnag":
        add(
          items,
          "Bugsnag",
          "Observability",
          0,
          59,
          "Free 7.5k events/mo; Team $59/mo"
        );
        break;
    }
  }

  // ── Monitoring ──
  const monitoring = get(a, "monitoring") as string | undefined;
  if (monitoring && monitoring !== "none") {
    switch (monitoring) {
      case "sentry-perf":
        add(
          items,
          "Sentry Performance",
          "Observability",
          0,
          26,
          "Included in Sentry Team"
        );
        break;
      case "datadog":
        add(
          items,
          "Datadog",
          "Observability",
          15,
          31,
          "~$15/host/mo (Infra) + $31/host/mo (APM)"
        );
        break;
      case "grafana":
        add(
          items,
          "Grafana Cloud",
          "Observability",
          0,
          19,
          "Free tier; Pro $19/mo platform fee"
        );
        break;
      case "betteruptime":
        add(
          items,
          "Better Uptime",
          "Observability",
          0,
          25,
          "Free tier; paid from ~$25/mo"
        );
        break;
    }
  }

  // ── Caching ──
  const caching = get(a, "caching") as string | undefined;
  if (caching && caching !== "none") {
    switch (caching) {
      case "redis":
        add(
          items,
          "Redis / Upstash",
          "Caching",
          0,
          10,
          "Free tier available; paid from ~$10/mo"
        );
        break;
      case "memory":
        add(items, "In-process memory", "Caching", 0, 0, "$0");
        break;
      case "cdn":
        add(
          items,
          "CDN / edge cache",
          "Caching",
          0,
          0,
          "Usually included with hosting"
        );
        break;
    }
  }

  // ── Job Queue ──
  const jobQueue = get(a, "jobQueue") as string | undefined;
  if (jobQueue && jobQueue !== "none") {
    switch (jobQueue) {
      case "inngest":
        add(
          items,
          "Inngest",
          "Background Jobs",
          0,
          0,
          "Free tier generous for MVPs"
        );
        break;
      case "trigger-dev":
        add(
          items,
          "Trigger.dev",
          "Background Jobs",
          0,
          0,
          "Free tier available"
        );
        break;
      case "bullmq":
        add(
          items,
          "BullMQ + Redis",
          "Background Jobs",
          0,
          10,
          "$0 if self-hosted Redis; ~$10/mo if managed"
        );
        break;
      case "temporal":
        add(
          items,
          "Temporal Cloud",
          "Background Jobs",
          0,
          20,
          "~$20/mo+ at low volume"
        );
        break;
      case "cron":
        add(items, "Simple cron", "Background Jobs", 0, 0, "$0");
        break;
    }
  }

  // ── Payment (only note, not fixed cost) ──
  if (bool(a, "hasBilling")) {
    const provider = get(a, "paymentProvider") as string | undefined;
    switch (provider) {
      case "stripe":
        add(
          items,
          "Stripe",
          "Payments",
          0,
          0,
          "2.9% + 30¢ per transaction — no fixed monthly fee"
        );
        break;
      case "paddle":
        add(
          items,
          "Paddle",
          "Payments",
          0,
          0,
          "5% + 50¢ per transaction — no fixed monthly fee"
        );
        break;
      case "lemonsqueezy":
        add(
          items,
          "Lemon Squeezy",
          "Payments",
          0,
          0,
          "5% + 50¢ per transaction — no fixed monthly fee"
        );
        break;
      case "revenuecat":
        add(
          items,
          "RevenueCat",
          "Payments",
          0,
          0,
          "Free up to $10k/mo; then 1% of revenue"
        );
        break;
      default:
        add(items, "Payments", "Payments", 0, 0, "Not decided");
    }
  }

  // ── CMS ──
  const cms = get(a, "cms") as string | undefined;
  if (cms && cms !== "none") {
    switch (cms) {
      case "mdx":
        add(items, "MDX in repo", "CMS", 0, 0, "$0");
        break;
      case "sanity":
        add(items, "Sanity", "CMS", 0, 15, "Free tier; paid from ~$15/mo");
        break;
      case "contentful":
        add(items, "Contentful", "CMS", 0, 0, "Free tier available");
        break;
      case "notion":
        add(
          items,
          "Notion as CMS",
          "CMS",
          0,
          0,
          "Free for personal use; $10/mo/user for teams"
        );
        break;
      case "payload":
        add(
          items,
          "Payload CMS",
          "CMS",
          0,
          0,
          "Self-host free; Cloud pricing varies"
        );
        break;
    }
  }

  // ── CI/CD ──
  const cicd = get(a, "cicd") as string | undefined;
  if (cicd && cicd !== "none") {
    switch (cicd) {
      case "github-actions":
        add(
          items,
          "GitHub Actions",
          "CI/CD",
          0,
          0,
          "Free 2,000 min/mo for public/private repos"
        );
        break;
      case "vercel-builds":
        add(
          items,
          "Vercel built-in CI",
          "CI/CD",
          0,
          0,
          "Included in Vercel plan"
        );
        break;
      case "circleci":
        add(
          items,
          "CircleCI",
          "CI/CD",
          0,
          15,
          "Free 6,000 credits/mo; paid from ~$15/mo"
        );
        break;
      case "other":
        add(items, "Other CI/CD", "CI/CD", 0, 0, "Cost varies");
        break;
    }
  }

  // ── Search ──
  if (bool(a, "searchNeeded")) {
    add(
      items,
      "Full-text / semantic search",
      "Search",
      0,
      10,
      "Algolia/Typesense free tiers; ~$0–10/mo at MVP scale"
    );
  }

  // ── Realtime sync ──
  if (bool(a, "realtimeSync")) {
    add(
      items,
      "Real-time sync",
      "Realtime",
      0,
      10,
      "Supabase realtime free; Pusher ~$10/mo"
    );
  }

  const minTotal = items.reduce((sum, i) => sum + i.min, 0);
  const maxTotal = items.reduce((sum, i) => sum + i.max, 0);
  const freeTierPossible = items.every((i) => i.min === 0);

  return { items, minTotal, maxTotal, freeTierPossible };
}

export function formatCostEstimate(est: CostEstimate): string {
  if (est.items.length === 0) {
    return "## Cost Estimate\n\nNo paid services selected.\n";
  }

  const lines: string[] = [];
  lines.push("## Monthly Cost Estimate\n");
  lines.push(
    "_Rough MVP-scale estimates based on your selections. Prices change — treat these as ballpark numbers._\n"
  );

  let currentCategory = "";
  for (const item of est.items) {
    if (item.category !== currentCategory) {
      currentCategory = item.category;
      lines.push(`**${currentCategory}**`);
    }
    const cost =
      item.min === item.max
        ? item.min === 0
          ? "Free"
          : `$${item.min}/mo`
        : `$${item.min}–${item.max}/mo`;
    lines.push(
      `- ${item.service}: ${cost}${item.note ? ` — ${item.note}` : ""}`
    );
  }

  lines.push("");
  if (est.freeTierPossible) {
    lines.push(
      `**Total: $${est.minTotal}–$${est.maxTotal}/mo** (all selected services offer free tiers — you may pay $0 at MVP scale).`
    );
  } else {
    lines.push(
      `**Total: ~$${est.minTotal}–$${est.maxTotal}/mo** at low traffic / small team scale.`
    );
  }

  return lines.join("\n") + "\n";
}
