import type { Config } from "@netlify/functions";

// Netlify Scheduled Function for finalizing disputes after the appeal window.
const handler = async () => {
  const base = Netlify.env.get("URL") || Netlify.env.get("DEPLOY_URL");
  const secret = Netlify.env.get("CRON_SECRET");

  if (!base || !secret) {
    throw new Error("cron-finalize-disputes: missing URL or CRON_SECRET environment variable");
  }

  const res = await fetch(`${base}/api/cron/finalize-disputes`, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`cron-finalize-disputes failed with status ${res.status}: ${body}`);
  }
};

export default handler;

export const config: Config = {
  schedule: "47 0 * * *",
};
