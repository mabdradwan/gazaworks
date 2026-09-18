import type { Config } from "@netlify/functions";

// Replaces the Vercel cron entry: {"path":"/api/cron/finalize-disputes","schedule":"47 0 * * *"}
const handler = async () => {
  const base = process.env.URL || process.env.DEPLOY_URL;
  const secret = process.env.CRON_SECRET;

  if (!base || !secret) {
    console.error("cron-finalize-disputes: missing URL or CRON_SECRET env var");
    return new Response("missing config", { status: 500 });
  }

  const res = await fetch(`${base}/api/cron/finalize-disputes`, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });

  const body = await res.text();
  if (!res.ok) console.error("cron-finalize-disputes failed", res.status, body);
  return new Response(body, { status: res.status });
};

export default handler;

export const config: Config = {
  schedule: "47 0 * * *",
};
