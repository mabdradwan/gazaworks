import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(req:NextRequest){
  const auth=await requirePermission("users.read");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const profileId=req.nextUrl.searchParams.get("profileId");if(!profileId)return NextResponse.json({error:"profile_required"},{status:400});
  const {data,error}=await supabaseAdmin().from("profile_admin_notes").select("id,profile_id,author_id,note,created_at,profiles!profile_admin_notes_author_id_fkey(display_name)").eq("profile_id",profileId).order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  const auth=await requirePermission("users.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{const i=z.object({profileId:z.string().uuid(),note:z.string().trim().min(1).max(5000)}).parse(await req.json());const {data,error}=await supabaseAdmin().from("profile_admin_notes").insert({profile_id:i.profileId,author_id:auth.user.id,note:i.note}).select("id").single();return error?NextResponse.json({error:"save_failed"},{status:400}):NextResponse.json(data,{status:201})}catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
