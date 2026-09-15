import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

const createSchema=z.object({
  talentId:z.string().uuid(),title:z.string().trim().min(5).max(160),description:z.string().trim().min(20).max(10000),
  budgetMinor:z.number().int().positive().optional(),currency:z.string().length(3).optional(),desiredDeliveryAt:z.string().datetime().optional()
});

export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("direct_hire_requests").select("id,client_id,talent_id,title,description,budget_minor,currency,desired_delivery_at,status,converted_work_request_id,created_at,updated_at,client:profiles!direct_hire_requests_client_id_fkey(display_name),talent:profiles!direct_hire_requests_talent_id_fkey(display_name,account_type)").order("created_at",{ascending:false}).limit(100);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function POST(req:NextRequest){
  try{
    const input=createSchema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data:me}=await db.from("profiles").select("account_type,account_status").eq("id",user.id).single();
    if(me?.account_type!=="client"||me.account_status!=="active")return NextResponse.json({error:"client_required"},{status:403});
    const {data:target}=await db.from("profiles").select("id,account_type,account_status,individual_profiles(verification_status),team_profiles(verification_status)").eq("id",input.talentId).single();
    const ind=Array.isArray(target?.individual_profiles)?target?.individual_profiles[0]:target?.individual_profiles;
    const team=Array.isArray(target?.team_profiles)?target?.team_profiles[0]:target?.team_profiles;
    if(!target||target.account_status!=="active"||!["individual","team"].includes(target.account_type)||String(ind?.verification_status??team?.verification_status)!=="verified")return NextResponse.json({error:"verified_talent_required"},{status:400});
    const {data,error}=await db.from("direct_hire_requests").insert({client_id:user.id,talent_id:input.talentId,title:input.title,description:input.description,budget_minor:input.budgetMinor??null,currency:input.currency?.toUpperCase()??null,desired_delivery_at:input.desiredDeliveryAt??null}).select("id").single();
    return error?NextResponse.json({error:"create_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PATCH(req:NextRequest){
  try{
    const input=z.object({id:z.string().uuid(),action:z.enum(["accept","decline","withdraw"])}).parse(await req.json());
    const session=await supabaseServer(),{data:{user}}=await session.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const admin=supabaseAdmin();const {data:r}=await admin.from("direct_hire_requests").select("*").eq("id",input.id).single();
    if(!r||r.status!=="sent")return NextResponse.json({error:"not_available"},{status:409});
    if(input.action==="withdraw"){
      if(r.client_id!==user.id)return NextResponse.json({error:"forbidden"},{status:403});
      await admin.from("direct_hire_requests").update({status:"withdrawn",updated_at:new Date().toISOString()}).eq("id",r.id);
      return NextResponse.json({ok:true});
    }
    if(r.talent_id!==user.id)return NextResponse.json({error:"forbidden"},{status:403});
    if(input.action==="decline"){
      await admin.from("direct_hire_requests").update({status:"declined",updated_at:new Date().toISOString()}).eq("id",r.id);
      await admin.from("notifications").insert({profile_id:r.client_id,category:"projects",title:"Direct work request declined",body:"A professional declined your direct work request.",data:{directHireId:r.id}});
      return NextResponse.json({ok:true});
    }
    const budget=Number(r.budget_minor??1),currency=String(r.currency??"USD");
    const {data:w,error}=await admin.from("work_requests").insert({client_id:r.client_id,title:r.title,description:r.description,category_id:null,budget_min_minor:budget,budget_max_minor:budget,currency,visibility:"invite_only",status:"published",delivery_expectations:r.desired_delivery_at?"Desired delivery: "+r.desired_delivery_at:null,notes:"Created from a direct GazaWorks hire request."}).select("id").single();
    if(error||!w)return NextResponse.json({error:"conversion_failed"},{status:400});
    await admin.from("work_request_invites").insert({work_request_id:w.id,profile_id:r.talent_id});
    await admin.from("direct_hire_requests").update({status:"converted",converted_work_request_id:w.id,updated_at:new Date().toISOString()}).eq("id",r.id);
    await admin.from("notifications").insert([{profile_id:r.client_id,category:"projects",title:"Direct work request accepted",body:"The professional accepted your direct request. They can now send a private offer.",data:{workRequestId:w.id,directHireId:r.id}},{profile_id:r.talent_id,category:"projects",title:"Send your offer",body:"Your accepted direct request is ready for a private offer.",data:{workRequestId:w.id,directHireId:r.id}}]);
    return NextResponse.json({ok:true,workRequestId:w.id});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
