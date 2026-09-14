import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("notifications").select("id,category,title,body,data,read_at,created_at").eq("profile_id",user.id).order("created_at",{ascending:false}).limit(100);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function PATCH(req:NextRequest){
  try{
    const {id}=z.object({id:z.string().uuid()}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {error}=await db.from("notifications").update({read_at:new Date().toISOString()}).eq("id",id).eq("profile_id",user.id);
    return NextResponse.json({ok:!error},{status:error?400:200});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
