import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("verification.approve");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const admin=supabaseAdmin();const {data,error}=await admin.from("verification_requests").select("id,profile_id,status,submitted_at,internal_notes,decision_reason,decided_at,profiles!verification_requests_profile_id_fkey(display_name,account_type),appointments(id,starts_at,ends_at,status)").order("submitted_at",{ascending:false}).limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function PATCH(req:NextRequest){
 try{const i=z.object({id:z.string().uuid(),status:z.enum(["under_review","interview_required","interview_scheduled","pending","verified","changes_requested","rejected","suspended"]),internalNotes:z.string().max(5000).optional(),reason:z.string().max(5000).optional()}).parse(await req.json());return await executeWorkflow("gw_verify",{verification_id:i.id,next_status:i.status,internal_notes:i.internalNotes??null,reason:i.reason??null},200);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
