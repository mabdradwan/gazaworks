import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("disputes.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("disputes").select("*,dispute_evidence(*),appeals(*)").order("created_at",{ascending:false}).limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function PATCH(req:NextRequest){
 try{const i=z.object({id:z.string().uuid(),decision:z.enum(["worker_full","client_full","split"]),workerAwardMinor:z.number().int().nonnegative(),clientRefundMinor:z.number().int().nonnegative(),reasoning:z.string().trim().min(10).max(8000)}).parse(await req.json());return await executeWorkflow("gw_decide_dispute",{dispute_id:i.id,decision:i.decision,worker_award:i.workerAwardMinor,client_refund:i.clientRefundMinor,reasoning:i.reasoning},200);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
