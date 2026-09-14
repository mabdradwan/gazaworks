import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("verification.approve");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const admin=supabaseAdmin();const {data,error}=await admin.from("verification_requests").select("id,profile_id,status,submitted_at,internal_notes,decision_reason,decided_at,profiles(display_name,account_type),appointments(id,starts_at,ends_at,status)").order("submitted_at",{ascending:false}).limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function PATCH(req:NextRequest){
  const auth=await requirePermission("verification.approve");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const input=z.object({id:z.string().uuid(),status:z.enum(["under_review","interview_required","interview_scheduled","pending","verified","changes_requested","rejected","suspended"]),internalNotes:z.string().max(5000).optional(),reason:z.string().max(5000).optional()}).parse(await req.json());
    const admin=supabaseAdmin();const {data:v}=await admin.from("verification_requests").select("profile_id").eq("id",input.id).single();if(!v)return NextResponse.json({error:"not_found"},{status:404});
    const patch={status:input.status,internal_notes:input.internalNotes,decision_reason:input.reason,reviewer_id:auth.user.id,...(["verified","rejected","changes_requested","suspended"].includes(input.status)?{decided_at:new Date().toISOString()}:{})};
    const {error}=await admin.from("verification_requests").update(patch).eq("id",input.id);
    if(!error){
      const {data:p}=await admin.from("profiles").select("account_type").eq("id",v.profile_id).single();
      if(p?.account_type==="individual")await admin.from("individual_profiles").update({verification_status:input.status}).eq("profile_id",v.profile_id);
      if(p?.account_type==="team")await admin.from("team_profiles").update({verification_status:input.status}).eq("profile_id",v.profile_id);
      await admin.from("notifications").insert({profile_id:v.profile_id,category:"verification",title:"Verification status updated",body:`Your GazaWorks verification status is now ${input.status.replaceAll("_"," ")}.`,data:{verificationRequestId:input.id,status:input.status}});
    }
    return NextResponse.json({ok:!error},{status:error?400:200});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
