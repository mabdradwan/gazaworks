import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function POST(req:NextRequest){
  try{
    const {offerId}=z.object({offerId:z.string().uuid()}).parse(await req.json());
    const session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const admin=supabaseAdmin();
    const {data:offer}=await admin.from("offers").select("*,work_requests!inner(client_id,title)").eq("id",offerId).single();
    const wr=offer?.work_requests as unknown as {client_id:string;title:string}|null;
    if(!offer||!wr||wr.client_id!==user.id)return NextResponse.json({error:"forbidden"},{status:403});
    if(offer.status==="accepted")return NextResponse.json({error:"already_accepted"},{status:409});
    const deadline=new Date(Date.now()+offer.delivery_days*86400000).toISOString();
    const {data:project,error}=await admin.from("projects").insert({work_request_id:offer.work_request_id,client_id:user.id,talent_id:offer.talent_id,accepted_offer_id:offer.id,status:"awaiting_payment",deadline}).select("id").single();
    if(error)return NextResponse.json({error:"accept_failed",detail:error.message},{status:400});
    await admin.from("project_agreements").insert({project_id:project.id,scope:offer.scope,price_minor:offer.price_minor,currency:offer.currency,deadline,accepted_at:new Date().toISOString(),client_snapshot:{id:user.id},talent_snapshot:{id:offer.talent_id},offer_snapshot:{id:offer.id,price_minor:offer.price_minor,currency:offer.currency,delivery_days:offer.delivery_days,proposal:offer.proposal,scope:offer.scope}});
    const {data:room}=await admin.from("chat_rooms").insert({project_id:project.id}).select("id").single();
    if(room)await admin.from("chat_participants").insert([{room_id:room.id,profile_id:user.id},{room_id:room.id,profile_id:offer.talent_id}]);
    await admin.from("offers").update({status:"accepted"}).eq("id",offer.id);
    await admin.from("offers").update({status:"declined"}).eq("work_request_id",offer.work_request_id).neq("id",offer.id);
    await admin.from("work_requests").update({status:"awarded"}).eq("id",offer.work_request_id);
    await admin.from("notifications").insert([
      {profile_id:offer.talent_id,category:"projects",title:"Offer accepted",body:"A client accepted your offer. Wait for payment confirmation before starting.",data:{projectId:project.id}},
      {profile_id:user.id,category:"payments",title:"Project awaiting payment",body:"Fund the project before work begins.",data:{projectId:project.id}}
    ]);
    return NextResponse.json({projectId:project.id,roomId:room?.id??null},{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
