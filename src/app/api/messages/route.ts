import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(req:NextRequest){
  const roomId=req.nextUrl.searchParams.get("roomId"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  if(!roomId)return NextResponse.json({error:"room_required"},{status:400});
  const {data,error}=await db.from("chat_messages").select("id,room_id,sender_id,body,message_type,storage_path,status,created_at,profiles!chat_messages_sender_id_fkey(display_name,avatar_path)").eq("room_id",roomId).order("created_at",{ascending:true}).limit(200);
  if(error)return NextResponse.json({error:"load_failed"},{status:400});
  const rows=await Promise.all((data??[]).map(async m=>({...m,attachment_url:m.storage_path?(await db.storage.from("message-files").createSignedUrl(m.storage_path,1800)).data?.signedUrl??null:null})));
  return NextResponse.json(rows);
}


export async function POST(req:NextRequest){
 try{const i=z.object({roomId:z.string().uuid(),body:z.string().trim().min(1).max(5000)}).parse(await req.json());return await executeWorkflow("gw_send_message",{room_id:i.roomId,body:i.body},201);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
