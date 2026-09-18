import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

export async function POST(req:NextRequest){
  try{
    const input=z.object({disputeId:z.string().uuid(),fileName:z.string().min(1).max(180),mimeType:z.string().min(3).max(150),sizeBytes:z.number().int().positive().max(52_428_800)}).parse(await req.json());
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data:d}=await db.from("disputes").select("id,projects(client_id,talent_id)").eq("id",input.disputeId).single();
    const project=Array.isArray(d?.projects)?d?.projects[0]:d?.projects;
    if(!d||!project||![project.client_id,project.talent_id].includes(user.id))return NextResponse.json({error:"forbidden"},{status:403});
    const safe=input.fileName.replace(/[^a-zA-Z0-9._-]+/g,"-"),path=input.disputeId+"/"+user.id+"/"+crypto.randomUUID()+"-"+safe;
    const {data,error}=await db.storage.from("dispute-evidence").createSignedUploadUrl(path);
    return error?NextResponse.json({error:"upload_unavailable"},{status:400}):NextResponse.json({path,token:data.token,signedUrl:data.signedUrl});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
