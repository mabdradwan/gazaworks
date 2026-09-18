import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

async function ownsProject(db:Awaited<ReturnType<typeof supabaseServer>>,projectId:string,userId:string){
  const {data}=await db.from("projects").select("id,client_id,talent_id").eq("id",projectId).single();
  return Boolean(data&&(data.client_id===userId||data.talent_id===userId));
}

export async function GET(req:NextRequest){
  const projectId=req.nextUrl.searchParams.get("projectId"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!projectId)return NextResponse.json({error:"invalid_request"},{status:400});
  if(!(await ownsProject(db,projectId,user.id)))return NextResponse.json({error:"forbidden"},{status:403});
  const {data,error}=await db.from("project_files").select("id,project_id,uploader_id,delivery_id,storage_path,mime_type,size_bytes,created_at").eq("project_id",projectId).order("created_at");
  if(error)return NextResponse.json({error:"load_failed"},{status:400});
  const rows=await Promise.all((data??[]).map(async x=>({...x,url:(await db.storage.from("project-files").createSignedUrl(x.storage_path,1800)).data?.signedUrl??null})));
  return NextResponse.json(rows);
}

export async function POST(req:NextRequest){
  try{
    const input=z.object({projectId:z.string().uuid(),fileName:z.string().min(1).max(180),mimeType:z.string().min(3).max(150),sizeBytes:z.number().int().positive().max(104_857_600)}).parse(await req.json());
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    if(!(await ownsProject(db,input.projectId,user.id)))return NextResponse.json({error:"forbidden"},{status:403});
    const safe=input.fileName.replace(/[^a-zA-Z0-9._-]+/g,"-"),path=input.projectId+"/"+user.id+"/"+crypto.randomUUID()+"-"+safe;
    const {data,error}=await db.storage.from("project-files").createSignedUploadUrl(path);
    return error?NextResponse.json({error:"upload_unavailable"},{status:400}):NextResponse.json({path,token:data.token,signedUrl:data.signedUrl});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PUT(req:NextRequest){
  try{
    const input=z.object({projectId:z.string().uuid(),path:z.string(),mimeType:z.string(),sizeBytes:z.number().int().positive(),deliveryId:z.string().uuid().nullable().optional()}).parse(await req.json());
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    if(!(await ownsProject(db,input.projectId,user.id))||!input.path.startsWith(input.projectId+"/"+user.id+"/"))return NextResponse.json({error:"forbidden"},{status:403});
    const {data,error}=await db.from("project_files").insert({project_id:input.projectId,uploader_id:user.id,delivery_id:input.deliveryId??null,storage_path:input.path,mime_type:input.mimeType,size_bytes:input.sizeBytes}).select("id").single();
    return error?NextResponse.json({error:"record_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
