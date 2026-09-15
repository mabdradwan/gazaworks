import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(req:NextRequest){
  const workRequestId=req.nextUrl.searchParams.get("workRequestId"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!workRequestId)return NextResponse.json({error:"invalid_request"},{status:400});
  const {data,error}=await db.from("work_request_files").select("id,work_request_id,storage_path,mime_type,size_bytes,created_at").eq("work_request_id",workRequestId).order("created_at");
  if(error)return NextResponse.json({error:"load_failed"},{status:400});
  const rows=await Promise.all((data??[]).map(async x=>{
    const {data:s}=await db.storage.from("work-request-files").createSignedUrl(x.storage_path,1800);
    return {...x,url:s?.signedUrl??null};
  }));
  return NextResponse.json(rows);
}

export async function POST(req:NextRequest){
  try{
    const input=z.object({workRequestId:z.string().uuid(),fileName:z.string().min(1).max(180),mimeType:z.string().min(3).max(150),sizeBytes:z.number().int().positive().max(52_428_800)}).parse(await req.json());
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data:w}=await db.from("work_requests").select("id").eq("id",input.workRequestId).eq("client_id",user.id).single();
    if(!w)return NextResponse.json({error:"forbidden"},{status:403});
    const safe=input.fileName.replace(/[^a-zA-Z0-9._-]+/g,"-"),path=input.workRequestId+"/"+user.id+"/"+crypto.randomUUID()+"-"+safe;
    const {data,error}=await db.storage.from("work-request-files").createSignedUploadUrl(path);
    return error?NextResponse.json({error:"upload_unavailable"},{status:400}):NextResponse.json({path,token:data.token,signedUrl:data.signedUrl});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PUT(req:NextRequest){
  try{
    const input=z.object({workRequestId:z.string().uuid(),path:z.string(),mimeType:z.string().min(3).max(150),sizeBytes:z.number().int().positive().max(52_428_800)}).parse(await req.json());
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    if(!input.path.startsWith(input.workRequestId+"/"+user.id+"/"))return NextResponse.json({error:"forbidden"},{status:403});
    const {data,error}=await db.from("work_request_files").insert({work_request_id:input.workRequestId,uploader_id:user.id,storage_path:input.path,mime_type:input.mimeType,size_bytes:input.sizeBytes}).select("id").single();
    return error?NextResponse.json({error:"record_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
