import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("payments.read");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("payouts").select("id,transaction_id,amount_minor,status,destination_private,transfer_reference,payout_date,notes,proof_path,created_at,transactions(project_id,currency,talent_id)").order("created_at",{ascending:false}).limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function PATCH(req:NextRequest){
 try{const i=z.object({id:z.string().uuid(),status:z.enum(["pending","approved","processing","paid","failed"]),destination:z.string().max(500).optional(),reference:z.string().max(300).optional(),notes:z.string().max(3000).optional()}).parse(await req.json());return await executeWorkflow("gw_update_payout",{payout_id:i.id,next_status:i.status,destination:i.destination??null,reference:i.reference??null,notes:i.notes??null},200);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
