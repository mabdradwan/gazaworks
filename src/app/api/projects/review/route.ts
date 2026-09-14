import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function POST(req:NextRequest){
  try{
    const input=z.object({projectId:z.string().uuid(),action:z.enum(["accept","request_revision"])}).parse(await req.json()),session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const admin=supabaseAdmin();
    const {data:p}=await admin.from("projects").select("id,client_id,talent_id,status").eq("id",input.projectId).single();
    if(!p||p.client_id!==user.id)return NextResponse.json({error:"forbidden"},{status:403});
    const {data:d}=await admin.from("project_deliveries").select("id").eq("project_id",p.id).is("accepted_at",null).order("submitted_at",{ascending:false}).limit(1).maybeSingle();
    if(!d)return NextResponse.json({error:"no_pending_delivery"},{status:409});
    if(input.action==="accept"){
      await admin.from("project_deliveries").update({accepted_at:new Date().toISOString()}).eq("id",d.id);
      await admin.from("projects").update({status:"payout_pending"}).eq("id",p.id);
      const {data:tx}=await admin.from("transactions").select("id,worker_entitlement_minor").eq("project_id",p.id).single();
      if(tx)await admin.from("payouts").insert({transaction_id:tx.id,amount_minor:tx.worker_entitlement_minor,status:"pending"});
      await admin.from("notifications").insert({profile_id:p.talent_id,category:"payments",title:"Work accepted",body:"The client accepted your delivery. Payout is now pending.",data:{projectId:p.id}});
    }else{
      await admin.from("project_deliveries").update({revision_requested_at:new Date().toISOString()}).eq("id",d.id);
      await admin.from("projects").update({status:"in_progress"}).eq("id",p.id);
      await admin.from("notifications").insert({profile_id:p.talent_id,category:"projects",title:"Revision requested",body:"The client requested a revision. Check the project conversation for details.",data:{projectId:p.id}});
    }
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
