import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("users.read");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("profiles").select("id,display_name,account_type,account_status,locale,onboarding_complete,created_at,individual_profiles(professional_title,verification_status),team_profiles(team_name,verification_status),client_profiles(full_name,country_code,company_name)").order("created_at",{ascending:false}).limit(500);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function PATCH(req:NextRequest){
  const auth=await requirePermission("users.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({id:z.string().uuid(),displayName:z.string().min(2).max(100).optional(),status:z.enum(["active","suspended","banned","deletion_pending"]).optional(),featured:z.boolean().optional()}).parse(await req.json());
    const admin=supabaseAdmin();const {data:p}=await admin.from("profiles").select("account_type,display_name,account_status").eq("id",i.id).single();if(!p)return NextResponse.json({error:"not_found"},{status:404});
    if(i.displayName!==undefined||i.status!==undefined)await admin.from("profiles").update({...(i.displayName!==undefined?{display_name:i.displayName}:{}),...(i.status!==undefined?{account_status:i.status}:{})}).eq("id",i.id);
    if(i.featured!==undefined&&p.account_type==="individual")await admin.from("individual_profiles").update({featured:i.featured}).eq("profile_id",i.id);
    if(i.featured!==undefined&&p.account_type==="team")await admin.from("team_profiles").update({featured:i.featured}).eq("profile_id",i.id);
    await admin.from("audit_logs").insert({actor_id:auth.user.id,action:"admin.user.update",entity_type:"profile",entity_id:i.id,old_data:p,new_data:i});
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
