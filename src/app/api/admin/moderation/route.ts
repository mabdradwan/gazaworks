import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("messages.review");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("message_moderation").select("id,message_id,reason,context_snapshot,review_deadline,decision,redacted_body,reviewed_at,chat_messages(body,sender_id,room_id,created_at)").order("review_deadline").limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function PATCH(req:NextRequest){
  const auth=await requirePermission("messages.review");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({id:z.string().uuid(),decision:z.enum(["approve","reject","redact"]),redactedBody:z.string().max(5000).optional()}).parse(await req.json());
    const admin=supabaseAdmin();const {data:m}=await admin.from("message_moderation").select("message_id").eq("id",i.id).single();if(!m)return NextResponse.json({error:"not_found"},{status:404});
    const status=i.decision==="approve"?"delivered":i.decision==="reject"?"rejected":"redacted";
    await admin.from("message_moderation").update({decision:i.decision,redacted_body:i.redactedBody,reviewer_id:auth.user.id,reviewed_at:new Date().toISOString()}).eq("id",i.id);
    const patch:Record<string,unknown>={status};if(i.decision==="redact"&&i.redactedBody)patch.body=i.redactedBody;
    const {error}=await admin.from("chat_messages").update(patch).eq("id",m.message_id);
    return NextResponse.json({ok:!error},{status:error?400:200});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
