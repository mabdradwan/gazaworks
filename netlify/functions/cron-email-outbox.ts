import type {Config} from "@netlify/functions";

export default async function handler(){
 const base=Netlify.env.get("URL");
 const secret=Netlify.env.get("CRON_SECRET");
 if(Netlify.env.get("EMAIL_DELIVERY_ENABLED")!=="true")return;
 if(!base||!secret)throw new Error("cron-email-outbox: missing URL or CRON_SECRET");
 const response=await fetch(`${base}/api/cron/email-outbox`,{method:"POST",headers:{authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(28000)});
 if(!response.ok)throw new Error(`cron-email-outbox failed: ${response.status}`);
}

export const config:Config={schedule:"*/10 * * * *"};
