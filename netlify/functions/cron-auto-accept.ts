import type { Config } from "@netlify/functions";

// Replaces the Vercel cron entry: {"path":"/api/cron/auto-accept","schedule":"17 0 * * *"}
// Calls the existing Next.js API route (all business logic stays there) with the
// same bearer-token auth the route already enforces via CRON_SECRET.
export default async () => {
  const base = process.env.URL || process.env.DEPLOY_URL;
  const secret = process.env.CRON_SECRET;

  if (!base || !secret) {
    console.error("cron-auto-accept: missing URL or CRON_SECRET env var");
    return new Response("missing config", { status: 500 });
  }

  const res = await fetch(`${base}/api/cron/auto-accept`, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });

  const body = await res.text();
  if (!res.ok) console.error("cron-auto-accept failed", res.status, body);
  return new Response(body, { status: res.status });
};

export const config: Config = {
  schedule: "17 0 * * *",
};
