import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {boundedWebhookBody,verifyEmailWebhook} from "@/lib/email/webhook";
import {supabaseAdmin} from "@/lib/supabase/admin";
export const runtime="nodejs";
const eventSchema=z.object({type:z.enum(["email.delivered","email.bounced","email.complained","email.suppressed","email.failed"]),created_at:z.string().datetime({offset:true}),data:z.object({email_id:z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/)})});
export async function POST(req:NextRequest){
 const secret=process.env.RESEND_WEBHOOK_SECRET;
 if(!secret)return NextResponse.json({error:"email_webhook_unconfigured"},{status:503});
 let body:string;
 try{body=await boundedWebhookBody(req);}catch{return NextResponse.json({error:"invalid_webhook_body"},{status:400});}
 if(!verifyEmailWebhook(body,req.headers,secret))return NextResponse.json({error:"invalid_signature"},{status:401});
 let input:unknown;
 try{input=JSON.parse(body);}catch{return NextResponse.json({error:"invalid_event"},{status:400});}
 if(typeof input!=="object"||input===null||!("type" in input)||typeof input.type!=="string")return NextResponse.json({error:"invalid_event"},{status:400});
 if(!eventSchema.shape.type.options.some(type=>type===input.type))return NextResponse.json({ignored:true});
 const event=eventSchema.safeParse(input);
 if(!event.success)return NextResponse.json({error:"invalid_event"},{status:400});
 const {error}=await supabaseAdmin().rpc("gw_email_delivery",{event_id:req.headers.get("svix-id"),message_id:event.data.data.email_id,event_type:event.data.type.slice(6),event_time:event.data.created_at});
 return error?NextResponse.json({error:"email_event_failed"},{status:500}):NextResponse.json({ok:true});
}
