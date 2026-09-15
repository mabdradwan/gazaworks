import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const mime=z.enum(["application/pdf","image/jpeg","image/png","image/webp"]);

export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("verification_documents").select("id,request_id,storage_path,mime_type,label,created_at").eq("profile_id",user.id).order("created_at",{ascending:false});
  if(error)return NextResponse.json({error:"load_failed"},{status:400});
  const rows=await Promise.all((data??[]).map(async x=>{
    const {data:s}=await db.storage.from("verification-documents").createSignedUrl(x.storage_path,1800);
    return {...x,url:s?.signedUrl??null};
  }));
  return NextResponse.json(rows);
}

export async function POST(req:NextRequest){
  try{
    const input=z.object({fileName:z.string().min(1).max(180),mimeType:mime,sizeBytes:z.number().int().positive().max(20_971_520)}).parse(await req.json());
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const safe=input.fileName.replace(/[^a-zA-Z0-9._-]+/g,"-"),path=user.id+"/"+crypto.randomUUID()+"-"+safe;
    const {data,error}=await db.storage.from("verification-documents").createSignedUploadUrl(path);
    return error?NextResponse.json({error:"upload_unavailable"},{status:400}):NextResponse.json({path,token:data.token,signedUrl:data.signedUrl});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PUT(req:NextRequest){
  try{
    const input=z.object({path:z.string(),mimeType:mime,label:z.string().max(120).optional(),requestId:z.string().uuid().nullable().optional()}).parse(await req.json());
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user||!input.path.startsWith(user.id+"/"))return NextResponse.json({error:"forbidden"},{status:403});
    const {data,error}=await db.from("verification_documents").insert({profile_id:user.id,request_id:input.requestId??null,storage_path:input.path,mime_type:input.mimeType,label:input.label??null}).select("id").single();
    return error?NextResponse.json({error:"record_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function DELETE(req:NextRequest){
  const id=req.nextUrl.searchParams.get("id"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!id)return NextResponse.json({error:"invalid_request"},{status:400});
  const {data}=await db.from("verification_documents").select("storage_path").eq("id",id).eq("profile_id",user.id).single();
  if(!data)return NextResponse.json({error:"not_found"},{status:404});
  const {error}=await db.from("verification_documents").delete().eq("id",id).eq("profile_id",user.id);
  if(!error)await db.storage.from("verification-documents").remove([data.storage_path]);
  return NextResponse.json({ok:!error},{status:error?400:200});
}
