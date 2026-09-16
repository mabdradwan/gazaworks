import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(){const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});const {data}=await db.from("appointments").select("id,starts_at,ends_at,status").eq("status","available").is("request_id",null).gte("starts_at",new Date().toISOString()).order("starts_at").limit(30);return NextResponse.json(data??[])}
export async function POST(req:NextRequest){
 try{const i=z.object({appointmentId:z.string().uuid(),requestId:z.string().uuid()}).parse(await req.json());return await executeWorkflow("gw_book_appointment",{appointment_id:i.appointmentId,verification_id:i.requestId},200);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
