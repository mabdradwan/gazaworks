import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {moderateConversation} from "@/domain/marketplace";
import {supabaseServer} from "@/lib/supabase/server";
import {rateLimit} from "@/lib/security";

const schema=z.object({roomId:z.string().uuid(),body:z.string().trim().min(1).max(5000)});

export async function GET(req:NextRequest){
  const roomId=req.nextUrl.searchParams.get("roomId"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  if(!roomId)return NextResponse.json({error:"room_required"},{status:400});
  const {data,error}=await db.from("chat_messages").select("id,room_id,sender_id,body,message_type,storage_path,status,created_at").eq("room_id",roomId).order("created_at",{ascending:true}).limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function POST(req:NextRequest){
  if(!rateLimit(`msg:${req.headers.get("x-forwarded-for")}`,30))return NextResponse.json({error:"rate_limited"},{status:429});
  try{
    const input=schema.parse(await req.json()),db=await supabaseServer();const {data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data:recent}=await db.from("chat_messages").select("body,created_at").eq("room_id",input.roomId).order("created_at",{ascending:false}).limit(5);
    const decision=moderateConversation((recent??[]).map(x=>({body:x.body??"",createdAt:new Date(x.created_at)})),input.body);
    const {data,error}=await db.from("chat_messages").insert({room_id:input.roomId,sender_id:user.id,body:input.body,message_type:"text",status:decision.status}).select("id,status,created_at").single();
    if(error)throw error;
    if(decision.status==="pending_moderation")await db.from("message_moderation").insert({message_id:data.id,reason:decision.reason,context_snapshot:{recentBodies:(recent??[]).map(x=>x.body)},review_deadline:decision.reviewDeadline?.toISOString()});
    return NextResponse.json({...data,notice:decision.status==="pending_moderation"?"Message held for review for up to 24 hours.":undefined},{status:201});
  }catch(e){return NextResponse.json({error:e instanceof z.ZodError?"invalid_request":"request_failed"},{status:e instanceof z.ZodError?400:500})}
}
