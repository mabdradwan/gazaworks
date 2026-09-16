import {NextRequest,NextResponse} from "next/server";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {executeWorkflow} from "@/lib/workflows";
import {appointmentActionSchema,appointmentCreateSchema,appointmentStatuses} from "@/domain/appointments";

export async function GET(req:NextRequest){
  const auth=await requirePermission("appointments.manage");
  if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const page=Number(req.nextUrl.searchParams.get("page")??"0"),status=req.nextUrl.searchParams.get("status");
  if(!Number.isSafeInteger(page)||page<0||page>10000||status&&!appointmentStatuses.some(s=>s===status))return NextResponse.json({error:"invalid_request"},{status:400});
  const db=supabaseAdmin();
  let query=db.from("appointments").select("id,starts_at,ends_at,employee_id,request_id,status,user_notes,internal_notes,version,attendance,verification_requests(profile_id,profiles!verification_requests_profile_id_fkey(display_name))",{count:"exact"}).order("starts_at",{ascending:false}).order("id").range(page*25,page*25+24);
  if(status)query=query.eq("status",status);
  const [records,staff]=await Promise.all([query,db.rpc("gw_appointment_staff",{actor:auth.user.id})]);
  if(records.error||staff.error)return NextResponse.json({error:"load_failed"},{status:500});
  const appointments=(records.data??[]).map(({verification_requests,...row})=>{
    const request=Array.isArray(verification_requests)?verification_requests[0]:verification_requests;
    const person=Array.isArray(request?.profiles)?request.profiles[0]:request?.profiles;
    return {...row,applicant_name:person?.display_name??null};
  });
  return NextResponse.json({appointments,staff:staff.data??[],total:records.count??0,page});
}

export async function POST(req:NextRequest){
  try{
    const i=appointmentCreateSchema.parse(await req.json());
    return executeWorkflow("gw_create_appointment",{starts_at:i.startsAt,ends_at:i.endsAt,employee_id:i.employeeId,user_notes:i.userNotes,internal_notes:i.internalNotes,slot_status:i.status},201);
  }catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}

export async function PATCH(req:NextRequest){
  try{
    const i=appointmentActionSchema.parse(await req.json());
    return executeWorkflow("gw_manage_appointment",{appointment_id:i.id,expected_version:i.version,action:i.action,new_starts_at:i.startsAt??null,new_ends_at:i.endsAt??null,staff_id:i.employeeId??null,applicant_notes:i.userNotes??null,staff_notes:i.internalNotes??null});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
