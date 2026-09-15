import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";
const status=z.enum(["available","booked","blocked","cancelled","completed","no_show"]);

export async function GET(){
  const auth=await requirePermission("appointments.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("appointments").select("id,starts_at,ends_at,employee_id,request_id,status,user_notes,internal_notes").order("starts_at",{ascending:false}).limit(300);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  const auth=await requirePermission("appointments.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{const i=z.object({startsAt:z.string().datetime(),endsAt:z.string().datetime(),employeeId:z.string().uuid().nullable().optional(),internalNotes:z.string().max(3000).optional()}).parse(await req.json());const {data,error}=await supabaseAdmin().from("appointments").insert({starts_at:i.startsAt,ends_at:i.endsAt,employee_id:i.employeeId??auth.user.id,status:"available",internal_notes:i.internalNotes}).select("id").single();return error?NextResponse.json({error:"create_failed"},{status:400}):NextResponse.json(data,{status:201})}catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
export async function PATCH(req:NextRequest){
  const auth=await requirePermission("appointments.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{const i=z.object({id:z.string().uuid(),status,internalNotes:z.string().max(3000).optional()}).parse(await req.json());const {error}=await supabaseAdmin().from("appointments").update({status:i.status,internal_notes:i.internalNotes}).eq("id",i.id);return NextResponse.json({ok:!error},{status:error?400:200})}catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
