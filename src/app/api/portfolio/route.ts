import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const schema=z.object({title:z.string().min(2).max(160),description:z.string().max(4000).optional(),categoryId:z.string().uuid().nullable().optional(),completedOn:z.string().date().nullable().optional()});

export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("portfolios").select("id,title,description,completed_on,category_id,portfolio_media(id,storage_path,mime_type,media_type,thumbnail_path,sort_order)").eq("profile_id",user.id).order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  try{
    const input=schema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data,error}=await db.from("portfolios").insert({profile_id:user.id,title:input.title,description:input.description,category_id:input.categoryId??null,completed_on:input.completedOn??null}).select("id").single();
    return error?NextResponse.json({error:"create_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
export async function PATCH(req:NextRequest){
  try{
    const input=schema.extend({id:z.string().uuid()}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {error}=await db.from("portfolios").update({title:input.title,description:input.description,category_id:input.categoryId??null,completed_on:input.completedOn??null}).eq("id",input.id).eq("profile_id",user.id);
    return NextResponse.json({ok:!error},{status:error?400:200});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
export async function DELETE(req:NextRequest){
  const id=req.nextUrl.searchParams.get("id"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!id)return NextResponse.json({error:"unauthorized"},{status:401});
  const {error}=await db.from("portfolios").delete().eq("id",id).eq("profile_id",user.id);
  return NextResponse.json({ok:!error},{status:error?400:200});
}
