import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("payments.read");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("payouts").select("id,transaction_id,amount_minor,status,destination_private,transfer_reference,payout_date,notes,proof_path,created_at,transactions(project_id,currency,talent_id)").order("created_at",{ascending:false}).limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function PATCH(req:NextRequest){
  const auth=await requirePermission("payouts.approve");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({id:z.string().uuid(),status:z.enum(["pending","approved","processing","paid","failed"]),destination:z.string().max(500).optional(),reference:z.string().max(300).optional(),notes:z.string().max(3000).optional()}).parse(await req.json());
    const admin=supabaseAdmin();const patch={status:i.status,destination_private:i.destination,transfer_reference:i.reference,notes:i.notes,approved_by:auth.user.id,...(i.status==="paid"?{payout_date:new Date().toISOString().slice(0,10)}:{})};const {data:p,error}=await admin.from("payouts").update(patch).eq("id",i.id).select("transaction_id").single();
    if(!error&&p&&i.status==="paid"){const {data:t}=await admin.from("transactions").select("project_id,talent_id").eq("id",p.transaction_id).single();if(t){await admin.from("projects").update({status:"paid"}).eq("id",t.project_id);await admin.from("notifications").insert({profile_id:t.talent_id,category:"payments",title:"Payout completed",body:"GazaWorks marked your payout as completed.",data:{payoutId:i.id}})}}
    return NextResponse.json({ok:!error},{status:error?400:200});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
