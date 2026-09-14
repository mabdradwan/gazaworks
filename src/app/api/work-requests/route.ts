import {NextRequest,NextResponse} from "next/server";
import {workRequestSchema} from "@/lib/security";
import {supabaseServer} from "@/lib/supabase/server";
import {ZodError,z} from "zod";

export async function GET(req:NextRequest){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const mine=req.nextUrl.searchParams.get("mine")==="1";
  let q=db.from("work_requests").select("id,client_id,title,description,category_id,budget_min_minor,budget_max_minor,currency,visibility,status,delivery_expectations,notes,created_at,work_request_skills(skill_id)").order("created_at",{ascending:false});
  if(mine)q=q.eq("client_id",user.id); else q=q.eq("status","published");
  const {data,error}=await q.limit(100);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function POST(req:NextRequest){
  try{
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const input=workRequestSchema.parse(await req.json());
    const {data:profile}=await db.from("profiles").select("account_type,account_status").eq("id",user.id).single();
    if(profile?.account_type!=="client"||profile.account_status!=="active")return NextResponse.json({error:"forbidden"},{status:403});
    const {skills,categoryId,budgetMin,budgetMax,...work}=input;
    const {data,error}=await db.from("work_requests").insert({...work,client_id:user.id,budget_min_minor:budgetMin,budget_max_minor:budgetMax,category_id:categoryId,status:"published"}).select("id").single();
    if(error)throw error;
    if(skills.length)await db.from("work_request_skills").insert(skills.map(skill_id=>({work_request_id:data.id,skill_id})));
    return NextResponse.json(data,{status:201});
  }catch(e){return NextResponse.json({error:e instanceof ZodError?"invalid_request":"request_failed"},{status:e instanceof ZodError?400:500})}
}

export async function PATCH(req:NextRequest){
  try{
    const input=z.object({id:z.string().uuid(),status:z.enum(["draft","published","closed","cancelled"])}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {error}=await db.from("work_requests").update({status:input.status}).eq("id",input.id).eq("client_id",user.id);
    return NextResponse.json({ok:!error},{status:error?400:200});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
