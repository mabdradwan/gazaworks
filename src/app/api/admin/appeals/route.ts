import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("disputes.manage");
  if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("appeals").select("id,dispute_id,submitted_by,reasoning,status,final_decision,decided_by,decided_at,created_at,disputes(project_id,decision,worker_award_minor,client_refund_minor,reasoning,decided_at)").order("created_at",{ascending:false}).limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}


export async function PATCH(req:NextRequest){
 try{const i=z.object({id:z.string().uuid(),workerAwardMinor:z.number().int().nonnegative(),clientRefundMinor:z.number().int().nonnegative(),reasoning:z.string().trim().min(10).max(8000)}).parse(await req.json());return await executeWorkflow("gw_decide_appeal",{appeal_id:i.id,worker_award:i.workerAwardMinor,client_refund:i.clientRefundMinor,reasoning:i.reasoning},200);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
