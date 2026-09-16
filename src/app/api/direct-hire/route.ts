import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {executeWorkflow} from "@/lib/workflows";

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
    const {data:target}=await supabaseAdmin().from("profiles").select("id,account_type,account_status,individual_profiles(verification_status),team_profiles(verification_status)").eq("id",input.talentId).single();
    const ind=Array.isArray(target?.individual_profiles)?target?.individual_profiles[0]:target?.individual_profiles;
    const team=Array.isArray(target?.team_profiles)?target?.team_profiles[0]:target?.team_profiles;
    if(!target||target.account_status!=="active"||!["individual","team"].includes(target.account_type)||String(ind?.verification_status??team?.verification_status)!=="verified")return NextResponse.json({error:"verified_talent_required"},{status:400});
    const {data,error}=await db.from("direct_hire_requests").insert({client_id:user.id,talent_id:input.talentId,title:input.title,description:input.description,budget_minor:input.budgetMinor??null,currency:input.currency?.toUpperCase()??null,desired_delivery_at:input.desiredDeliveryAt??null}).select("id").single();
    return error?NextResponse.json({error:"create_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PATCH(req:NextRequest){
 try{const i=z.object({id:z.string().uuid(),action:z.enum(["accept","decline","withdraw"])}).parse(await req.json());return await executeWorkflow("gw_direct_hire",{request_id:i.id,action:i.action});}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
