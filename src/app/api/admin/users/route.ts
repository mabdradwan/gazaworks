import {executeWorkflow} from "@/lib/workflows";
import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {adminUserSearchSchema,memberNamePattern} from "@/domain/admin-user-search";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(req:NextRequest){
  const auth=await requirePermission("users.read");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const search=adminUserSearchSchema.safeParse({q:req.nextUrl.searchParams.get('q')??'',type:req.nextUrl.searchParams.get('type')??undefined});
  if(!search.success)return NextResponse.json({error:'invalid_request'},{status:400});
  let query=supabaseAdmin().from("profiles").select("id,display_name,account_type,account_status,locale,onboarding_complete,created_at,individual_profiles(professional_title,verification_status),team_profiles(team_name,verification_status),client_profiles(full_name,country_code,company_name)");
  if(search.data.type)query=query.eq('account_type',search.data.type);
  if(search.data.q)query=query.ilike('display_name',memberNamePattern(search.data.q));
  const {data,error}=await query.order("created_at",{ascending:false}).limit(500);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function PATCH(req:NextRequest){
  const auth=await requirePermission("users.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({id:z.string().uuid(),displayName:z.string().min(2).max(100).optional(),status:z.enum(["active","suspended","banned","deletion_pending"]).optional(),featured:z.boolean().optional()}).parse(await req.json());
    return await executeWorkflow("gw_admin_user",{target:i.id,display_name:i.displayName??null,status:i.status??null,featured:i.featured??null});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
