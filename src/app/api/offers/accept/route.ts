import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

export async function POST(req:NextRequest){
  try{
    const {offerId}=z.object({offerId:z.string().uuid()}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data:offer}=await db.from("offers").select("*,work_requests!inner(client_id,title)").eq("id",offerId).single();
    const wr=offer?.work_requests as unknown as {client_id:string;title:string}|null;
    if(!offer||!wr||wr.client_id!==user.id)return NextResponse.json({error:"forbidden"},{status:403});
    const deadline=new Date(Date.now()+offer.delivery_days*86400000).toISOString();
    const {data:project,error}=await db.from("projects").insert({work_request_id:offer.work_request_id,client_id:user.id,talent_id:offer.talent_id,accepted_offer_id:offer.id,status:"awaiting_payment",deadline}).select("id").single();
    if(error)return NextResponse.json({error:"accept_failed"},{status:400});
    await db.from("project_agreements").insert({project_id:project.id,scope:offer.scope,price_minor:offer.price_minor,currency:offer.currency,deadline,accepted_at:new Date().toISOString(),client_snapshot:{id:user.id},talent_snapshot:{id:offer.talent_id},offer_snapshot:offer});
    await db.from("offers").update({status:"accepted"}).eq("id",offer.id);
    return NextResponse.json({projectId:project.id},{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
