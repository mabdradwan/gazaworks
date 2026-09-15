import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
const schema=z.object({projectId:z.string().uuid(),message:z.string().min(3).max(5000)});

export async function GET(req:NextRequest){
  const projectId=req.nextUrl.searchParams.get("projectId"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!projectId)return NextResponse.json({error:"invalid_request"},{status:400});
  const {data:p}=await db.from("projects").select("id,client_id,talent_id").eq("id",projectId).single();
  if(!p||![p.client_id,p.talent_id].includes(user.id))return NextResponse.json({error:"forbidden"},{status:403});
  const {data,error}=await db.from("project_deliveries").select("id,project_id,message,submitted_at,auto_accept_at,accepted_at,revision_requested_at").eq("project_id",projectId).order("submitted_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function POST(req:NextRequest){
  try{
    const input=schema.parse(await req.json()),session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const admin=supabaseAdmin();
    const {data:project}=await admin.from("projects").select("id,talent_id,client_id,status").eq("id",input.projectId).single();
    if(!project||project.talent_id!==user.id)return NextResponse.json({error:"forbidden"},{status:403});
    if(!["funded","in_progress"].includes(project.status))return NextResponse.json({error:"project_not_funded"},{status:409});
    const {data,error}=await admin.from("project_deliveries").insert({project_id:input.projectId,message:input.message}).select("id,auto_accept_at").single();
    if(error)return NextResponse.json({error:"delivery_failed"},{status:400});
    await admin.from("projects").update({status:"client_review"}).eq("id",input.projectId);
    await admin.from("notifications").insert({profile_id:project.client_id,category:"projects",title:"Work submitted",body:"Final work was submitted. Review it within 72 hours or it will be accepted automatically.",data:{projectId:input.projectId,deliveryId:data.id}});
    return NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
