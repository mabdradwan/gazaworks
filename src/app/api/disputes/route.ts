import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("disputes").select("id,project_id,reason,status,decision,reasoning,decided_at,created_at,appeals(id,status,reasoning,final_decision,created_at)").order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}


export async function POST(req:NextRequest){
 try{const i=z.object({projectId:z.string().uuid(),reason:z.string().trim().min(10).max(5000)}).parse(await req.json());return await executeWorkflow("gw_open_dispute",{project_id:i.projectId,reason:i.reason},201);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
