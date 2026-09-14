import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const schema=z.object({workRequestId:z.string().uuid(),priceMinor:z.number().int().positive(),currency:z.string().length(3),deliveryDays:z.number().int().positive().max(365),proposal:z.string().min(10).max(5000),scope:z.string().min(5).max(5000)});

export async function GET(req:NextRequest){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const workRequestId=req.nextUrl.searchParams.get("workRequestId");
  let q=db.from("offers").select("id,work_request_id,talent_id,price_minor,currency,delivery_days,proposal,scope,status,created_at,profiles!offers_talent_id_fkey(display_name,avatar_path,account_type)").order("created_at",{ascending:false});
  if(workRequestId)q=q.eq("work_request_id",workRequestId);
  const {data,error}=await q.limit(100);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  try{
    const input=schema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data,error}=await db.from("offers").insert({work_request_id:input.workRequestId,talent_id:user.id,price_minor:input.priceMinor,currency:input.currency.toUpperCase(),delivery_days:input.deliveryDays,proposal:input.proposal,scope:input.scope}).select("id").single();
    return error?NextResponse.json({error:"offer_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
