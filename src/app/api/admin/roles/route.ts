import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("users.read");
  if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const admin=supabaseAdmin();
  const [{data:roles},{data:permissions},{data:assignments}]=await Promise.all([
    admin.from("roles").select("id,name,description,system,role_permissions(permission_key)").order("name"),
    admin.from("permissions").select("key,description").order("key"),
    admin.from("admin_roles").select("profile_id,role_id,created_at,profiles(display_name)")
  ]);
  return NextResponse.json({roles:roles??[],permissions:permissions??[],assignments:assignments??[]});
}

export async function POST(req:NextRequest){
  const auth=await requirePermission("*");
  if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({name:z.string().min(2).max(80),description:z.string().max(500).optional(),permissions:z.array(z.string()).default([])}).parse(await req.json());
    const admin=supabaseAdmin();
    const {data:role,error}=await admin.from("roles").insert({name:i.name,description:i.description,system:false}).select("id").single();
    if(error)return NextResponse.json({error:"role_create_failed"},{status:400});
    if(i.permissions.length)await admin.from("role_permissions").insert(i.permissions.map(permission_key=>({role_id:role.id,permission_key})));
    return NextResponse.json({id:role.id},{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PATCH(req:NextRequest){
  const auth=await requirePermission("*");
  if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.discriminatedUnion("action",[
      z.object({action:z.literal("assign"),profileId:z.string().uuid(),roleId:z.string().uuid()}),
      z.object({action:z.literal("unassign"),profileId:z.string().uuid(),roleId:z.string().uuid()})
    ]).parse(await req.json());
    const admin=supabaseAdmin();
    if(i.action==="assign")await admin.from("admin_roles").upsert({profile_id:i.profileId,role_id:i.roleId,assigned_by:auth.user.id});
    else await admin.from("admin_roles").delete().eq("profile_id",i.profileId).eq("role_id",i.roleId);
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
