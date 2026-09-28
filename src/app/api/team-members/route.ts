import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const schema=z.object({
  publicName:z.string().trim().min(2).max(100),
  realNamePrivate:z.string().trim().max(160).optional(),
  title:z.string().trim().max(120),
  role:z.string().trim().max(120),
  bio:z.string().trim().max(2000),
  privacyMode:z.enum(["name_image","name_only","alias","anonymous"]),
  skills:z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  imagePath:z.string().max(500).nullable().optional()
});

async function ensureTeam(db:Awaited<ReturnType<typeof supabaseServer>>,userId:string){
  const {data}=await db.from("profiles").select("account_type,account_status").eq("id",userId).single();
  return data?.account_type==="team"&&data.account_status==="active";
}

export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!(await ensureTeam(db,user.id)))return NextResponse.json({error:"team_required"},{status:403});
  const {data,error}=await db.from("team_members").select("id,real_name_private,public_name,professional_title,role,bio,image_path,privacy_mode,skills,sort_order").eq("team_id",user.id).order("sort_order");
  if(error)return NextResponse.json({error:"load_failed"},{status:400});
  const rows=await Promise.all((data??[]).map(async x=>({...x,image_url:x.image_path?(await db.storage.from("avatars").createSignedUrl(x.image_path,1800)).data?.signedUrl??null:null})));
  return NextResponse.json(rows);
}

export async function POST(req:NextRequest){
  try{
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user||!(await ensureTeam(db,user.id)))return NextResponse.json({error:"team_required"},{status:403});
    const v=schema.parse(await req.json());
    if(v.imagePath&&!v.imagePath.startsWith(user.id+"/team-members/"))return NextResponse.json({error:"invalid_image"},{status:400});
    const {data,error}=await db.from("team_members").insert({team_id:user.id,real_name_private:v.realNamePrivate||null,public_name:v.publicName,professional_title:v.title,role:v.role,bio:v.bio,privacy_mode:v.privacyMode,skills:v.skills,image_path:v.imagePath??null}).select("id").single();
    return error?NextResponse.json({error:"create_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PATCH(req:NextRequest){
  try{
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user||!(await ensureTeam(db,user.id)))return NextResponse.json({error:"team_required"},{status:403});
    const v=schema.extend({id:z.string().uuid()}).parse(await req.json());
    if(v.imagePath&&!v.imagePath.startsWith(user.id+"/team-members/"))return NextResponse.json({error:"invalid_image"},{status:400});
    const {error}=await db.from("team_members").update({real_name_private:v.realNamePrivate||null,public_name:v.publicName,professional_title:v.title,role:v.role,bio:v.bio,privacy_mode:v.privacyMode,skills:v.skills,image_path:v.imagePath??null}).eq("id",v.id).eq("team_id",user.id);
    return NextResponse.json({ok:!error},{status:error?400:200});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function DELETE(req:NextRequest){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser(),id=req.nextUrl.searchParams.get("id");
  if(!user||!id||!(await ensureTeam(db,user.id)))return NextResponse.json({error:"team_required"},{status:403});
  const {data:member}=await db.from("team_members").select("image_path").eq("id",id).eq("team_id",user.id).single();
  const {error}=await db.from("team_members").delete().eq("id",id).eq("team_id",user.id);
  if(!error&&member?.image_path)await db.storage.from("avatars").remove([member.image_path]);
  return NextResponse.json({ok:!error},{status:error?400:200});
}
