import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const bodySchema=z.object({talentId:z.string().uuid()});

export async function GET(){
  const db=await supabaseServer(); const {data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("favorites").select("talent_id,created_at,profiles!favorites_talent_id_fkey(id,display_name,account_type,avatar_path)").eq("client_id",user.id).order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  try{
    const {talentId}=bodySchema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {error}=await db.from("favorites").upsert({client_id:user.id,talent_id:talentId});
    return error?NextResponse.json({error:"save_failed"},{status:400}):NextResponse.json({ok:true},{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
export async function DELETE(req:NextRequest){
  const talentId=req.nextUrl.searchParams.get("talentId"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!talentId)return NextResponse.json({error:"unauthorized"},{status:401});
  const {error}=await db.from("favorites").delete().eq("client_id",user.id).eq("talent_id",talentId);
  return NextResponse.json({ok:!error},{status:error?400:200});
}
