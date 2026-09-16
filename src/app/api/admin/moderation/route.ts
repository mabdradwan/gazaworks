import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("messages.review");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("message_moderation").select("id,message_id,reason,context_snapshot,review_deadline,decision,redacted_body,reviewed_at,chat_messages(body,sender_id,room_id,created_at)").order("review_deadline").limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function PATCH(req:NextRequest){
 try{const i=z.object({id:z.string().uuid(),decision:z.enum(["approve","reject","redact"]),redactedBody:z.string().max(5000).optional()}).parse(await req.json());return await executeWorkflow("gw_moderate_message",{moderation_id:i.id,decision:i.decision,replacement:i.redactedBody??null},200);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
