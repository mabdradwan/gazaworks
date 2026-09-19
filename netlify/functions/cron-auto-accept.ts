import type { Config } from "@netlify/functions";

// Netlify Scheduled Function for the 72-hour auto-accept workflow.
// Business logic stays in the protected Next.js API route.
const handler = async () => {
  const base = Netlify.env.get("URL") || Netlify.env.get("DEPLOY_URL");
  const secret = Netlify.env.get("CRON_SECRET");

  if (!base || !secret) {
    throw new Error("cron-auto-accept: missing URL or CRON_SECRET environment variable");
  }

  const res = await fetch(`${base}/api/cron/auto-accept`, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`cron-auto-accept failed with status ${res.status}: ${body}`);
  }
};

export default handler;

export const config: Config = {
  schedule: "17 0 * * *",
};
