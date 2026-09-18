import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(){
 const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 const fields="id,starts_at,ends_at,status,user_notes,version,attendance";
 const [slots,requests]=await Promise.all([
  db.from("appointments").select(fields).eq("status","available").is("request_id",null).gte("starts_at",new Date().toISOString()).order("starts_at").limit(30),
  db.from("verification_requests").select("id").eq("profile_id",user.id)
 ]);
 if(slots.error||requests.error)return NextResponse.json({error:"load_failed"},{status:500});
 const ids=(requests.data??[]).map(r=>r.id);
 const bookings=ids.length?await db.from("appointments").select(fields).in("request_id",ids).order("starts_at",{ascending:false}).limit(30):{data:[],error:null};
 if(bookings.error)return NextResponse.json({error:"load_failed"},{status:500});
 return NextResponse.json({available:slots.data??[],bookings:bookings.data??[]});
}
export async function POST(req:NextRequest){
 try{const i=z.object({appointmentId:z.string().uuid(),requestId:z.string().uuid()}).parse(await req.json());return await executeWorkflow("gw_book_appointment",{appointment_id:i.appointmentId,verification_id:i.requestId},200);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}

export async function PATCH(req:NextRequest){
 try{const i=z.object({appointmentId:z.string().uuid(),version:z.number().int().positive()}).strict().parse(await req.json());return executeWorkflow("gw_cancel_appointment",{appointment_id:i.appointmentId,expected_version:i.version});}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
