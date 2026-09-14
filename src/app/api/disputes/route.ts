import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("disputes").select("id,project_id,reason,status,decision,reasoning,decided_at,created_at,appeals(id,status,reasoning,final_decision,created_at)").order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function POST(req:NextRequest){
  try{
    const input=z.object({projectId:z.string().uuid(),reason:z.string().min(10).max(5000)}).parse(await req.json()),session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const admin=supabaseAdmin();
    const {data:p}=await admin.from("projects").select("id,client_id,talent_id,status").eq("id",input.projectId).single();
    if(!p||![p.client_id,p.talent_id].includes(user.id))return NextResponse.json({error:"forbidden"},{status:403});
    const {data,error}=await admin.from("disputes").insert({project_id:input.projectId,opened_by:user.id,reason:input.reason}).select("id").single();
    if(error)return NextResponse.json({error:"dispute_failed"},{status:400});
    await admin.from("projects").update({status:"disputed"}).eq("id",input.projectId);
    await admin.from("transactions").update({dispute_state:"open"}).eq("project_id",input.projectId);
    const other=p.client_id===user.id?p.talent_id:p.client_id;
    await admin.from("notifications").insert({profile_id:other,category:"disputes",title:"Dispute opened",body:"A dispute was opened for one of your projects. Funds remain frozen during review.",data:{projectId:input.projectId,disputeId:data.id}});
    return NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
