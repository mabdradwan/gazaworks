import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {boundedWebhookBody,emailWebhookEventId,verifyEmailWebhook} from "@/lib/email/webhook";
import {encodeBrevoMessageId} from "@/lib/email/provider";
import {supabaseAdmin} from "@/lib/supabase/admin";
export const runtime="nodejs";
const eventSchema=z.object({
 event:z.enum(["delivered","hardBounce","spam","invalid","blocked","error"]),
 "message-id":z.string().min(1).max(150),
 ts_event:z.number().int().positive().optional(),
 ts:z.number().int().positive().optional(),
});
const eventTypes:Record<z.infer<typeof eventSchema>["event"],string>={
 delivered:"delivered",hardBounce:"bounced",spam:"complained",invalid:"suppressed",blocked:"suppressed",error:"failed",
};
export async function POST(req:NextRequest){
 const secret=process.env.BREVO_WEBHOOK_TOKEN;
 if(!secret)return NextResponse.json({error:"email_webhook_unconfigured"},{status:503});
 if(!verifyEmailWebhook(req.headers,secret))return NextResponse.json({error:"unauthorized"},{status:401});
 let body:string;
 try{body=await boundedWebhookBody(req);}catch{return NextResponse.json({error:"invalid_webhook_body"},{status:400});}
 let input:unknown;
 try{input=JSON.parse(body);}catch{return NextResponse.json({error:"invalid_event"},{status:400});}
 if(typeof input!=="object"||input===null||!("event" in input)||typeof input.event!=="string")return NextResponse.json({error:"invalid_event"},{status:400});
 if(!eventSchema.shape.event.options.some(event=>event===input.event))return NextResponse.json({ignored:true});
 const parsed=eventSchema.safeParse(input);
 if(!parsed.success)return NextResponse.json({error:"invalid_event"},{status:400});
 const providerId=encodeBrevoMessageId(parsed.data["message-id"]);
 const ts=parsed.data.ts_event??parsed.data.ts;
 if(!providerId||!ts||!Number.isFinite(ts*1000)||Math.abs(Date.now()-ts*1000)>365*24*3600*1000)return NextResponse.json({error:"invalid_event"},{status:400});
 const {error}=await supabaseAdmin().rpc("gw_email_delivery",{event_id:emailWebhookEventId(body),message_id:providerId,event_type:eventTypes[parsed.data.event],event_time:new Date(ts*1000).toISOString()});
 return error?NextResponse.json({error:"email_event_failed"},{status:500}):NextResponse.json({ok:true});
}
