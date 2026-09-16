import {executeWorkflow} from "@/lib/workflows";
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
    return await executeWorkflow("gw_create_role",{name:i.name,description:i.description??null,permissions:i.permissions},201);
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
    return await executeWorkflow("gw_assign_role",{target:i.profileId,role_id:i.roleId,action:i.action});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

