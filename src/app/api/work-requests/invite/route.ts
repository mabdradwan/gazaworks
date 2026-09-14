import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function POST(req:NextRequest){
  try{
    const input=z.object({workRequestId:z.string().uuid(),talentId:z.string().uuid()}).parse(await req.json()),session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const admin=supabaseAdmin();
    const {data:w}=await admin.from("work_requests").select("id,client_id,title").eq("id",input.workRequestId).single();
    if(!w||w.client_id!==user.id)return NextResponse.json({error:"forbidden"},{status:403});
    const {data:t}=await admin.from("profiles").select("id,account_type,account_status").eq("id",input.talentId).single();
    if(!t||!["individual","team"].includes(t.account_type)||t.account_status!=="active")return NextResponse.json({error:"invalid_talent"},{status:409});
    const {error}=await admin.from("work_request_invites").upsert({work_request_id:w.id,profile_id:t.id});
    if(error)return NextResponse.json({error:"invite_failed"},{status:400});
    await admin.from("notifications").insert({profile_id:t.id,category:"projects",title:"Private work invitation",body:`You were invited to: ${w.title}`,data:{workRequestId:w.id}});
    return NextResponse.json({ok:true},{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
