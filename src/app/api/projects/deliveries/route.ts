import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(req:NextRequest){
  const projectId=req.nextUrl.searchParams.get("projectId"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!projectId)return NextResponse.json({error:"invalid_request"},{status:400});
  const {data:p}=await db.from("projects").select("id,client_id,talent_id").eq("id",projectId).single();
  if(!p||![p.client_id,p.talent_id].includes(user.id))return NextResponse.json({error:"forbidden"},{status:403});
  const {data,error}=await db.from("project_deliveries").select("id,project_id,message,submitted_at,auto_accept_at,accepted_at,revision_requested_at").eq("project_id",projectId).order("submitted_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}


export async function POST(req:NextRequest){
 try{const i=z.object({projectId:z.string().uuid(),message:z.string().trim().min(3).max(5000)}).parse(await req.json());return await executeWorkflow("gw_submit_delivery",{project_id:i.projectId,message:i.message},201);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
