import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
const schema=z.object({projectId:z.string().uuid(),message:z.string().min(3).max(5000)});
export async function POST(req:NextRequest){
  try{
    const input=schema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data,error}=await db.from("project_deliveries").insert({project_id:input.projectId,message:input.message}).select("id,auto_accept_at").single();
    if(error)return NextResponse.json({error:"delivery_failed"},{status:400});
    await db.from("projects").update({status:"client_review"}).eq("id",input.projectId).eq("talent_id",user.id);
    return NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
