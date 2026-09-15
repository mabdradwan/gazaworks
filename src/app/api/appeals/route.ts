import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
export async function POST(req:NextRequest){
  try{
    const input=z.object({disputeId:z.string().uuid(),reasoning:z.string().min(10).max(8000)}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data,error}=await db.from("appeals").insert({dispute_id:input.disputeId,submitted_by:user.id,reasoning:input.reasoning}).select("id").single();
    if(error)return NextResponse.json({error:"appeal_failed_or_window_closed"},{status:400});
    return NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
