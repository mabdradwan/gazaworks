import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const prepSchema=z.object({
  roomId:z.string().uuid(),
  fileName:z.string().min(1).max(180),
  mimeType:z.enum(["image/jpeg","image/png","image/webp","application/pdf","audio/webm","audio/ogg"]),
  sizeBytes:z.number().int().positive().max(50*1024*1024)
});
export async function POST(req:NextRequest){
  try{
    const input=prepSchema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data:membership}=await db.from("chat_participants").select("room_id").eq("room_id",input.roomId).eq("profile_id",user.id).maybeSingle();
    if(!membership)return NextResponse.json({error:"forbidden"},{status:403});
    const safe=input.fileName.replace(/[^a-zA-Z0-9._-]+/g,"-");
    const path=input.roomId+"/"+crypto.randomUUID()+"-"+safe;
    const {data,error}=await db.storage.from("message-files").createSignedUploadUrl(path);
    return error?NextResponse.json({error:"upload_unavailable"},{status:400}):NextResponse.json({path,token:data.token,signedUrl:data.signedUrl});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
export async function PUT(req:NextRequest){
  try{
    const input=z.object({roomId:z.string().uuid(),path:z.string().min(1),mimeType:z.string()}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    if(!input.path.startsWith(input.roomId+"/"))return NextResponse.json({error:"forbidden"},{status:403});
    const {data:membership}=await db.from("chat_participants").select("room_id").eq("room_id",input.roomId).eq("profile_id",user.id).maybeSingle();
    if(!membership)return NextResponse.json({error:"forbidden"},{status:403});
    const messageType=input.mimeType.startsWith("image/")?"image":input.mimeType.startsWith("audio/")?"voice":"document";
    const {data,error}=await db.from("chat_messages").insert({room_id:input.roomId,sender_id:user.id,message_type:messageType,storage_path:input.path,status:"delivered"}).select("id,status,created_at").single();
    return error?NextResponse.json({error:"message_record_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
