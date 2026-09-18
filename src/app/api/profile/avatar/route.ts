import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const meta=z.object({fileName:z.string().min(1).max(180),mimeType:z.enum(["image/jpeg","image/png","image/webp"]),sizeBytes:z.number().int().positive().max(10_485_760)});

export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data:p}=await db.from("profiles").select("avatar_path").eq("id",user.id).single();
  if(!p?.avatar_path)return NextResponse.json({path:null,url:null});
  const {data}=await db.storage.from("avatars").createSignedUrl(p.avatar_path,3600);
  return NextResponse.json({path:p.avatar_path,url:data?.signedUrl??null});
}

export async function POST(req:NextRequest){
  try{
    const input=meta.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const safe=input.fileName.replace(/[^a-zA-Z0-9._-]+/g,"-");
    const path=user.id+"/"+crypto.randomUUID()+"-"+safe;
    const {data,error}=await db.storage.from("avatars").createSignedUploadUrl(path);
    return error?NextResponse.json({error:"upload_unavailable"},{status:400}):NextResponse.json({path,token:data.token,signedUrl:data.signedUrl});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PUT(req:NextRequest){
  try{
    const {path}=z.object({path:z.string().min(3)}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user||!path.startsWith(user.id+"/"))return NextResponse.json({error:"forbidden"},{status:403});
    const {data:old}=await db.from("profiles").select("avatar_path").eq("id",user.id).single();
    const {error}=await db.from("profiles").update({avatar_path:path,updated_at:new Date().toISOString()}).eq("id",user.id);
    if(error)return NextResponse.json({error:"save_failed"},{status:400});
    if(old?.avatar_path&&old.avatar_path!==path)await db.storage.from("avatars").remove([old.avatar_path]);
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
