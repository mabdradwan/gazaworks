import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("disputes").select("id,project_id,reason,status,decision,reasoning,decided_at,created_at,appeals(id,status,reasoning,final_decision,created_at)").order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  try{
    const input=z.object({projectId:z.string().uuid(),reason:z.string().min(10).max(5000)}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data,error}=await db.from("disputes").insert({project_id:input.projectId,opened_by:user.id,reason:input.reason}).select("id").single();
    if(error)return NextResponse.json({error:"dispute_failed"},{status:400});
    await db.from("projects").update({status:"disputed"}).eq("id",input.projectId);
    return NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
