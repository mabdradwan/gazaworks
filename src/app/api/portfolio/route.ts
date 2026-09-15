import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const schema=z.object({
  title:z.string().min(2).max(160),description:z.string().max(4000).optional(),
  categoryId:z.string().uuid().nullable().optional(),completedOn:z.string().date().nullable().optional(),
  skillIds:z.array(z.string().uuid()).max(20).optional()
});

async function signedMedia(db:Awaited<ReturnType<typeof supabaseServer>>,rows:Record<string,unknown>[]){
  return Promise.all(rows.map(async raw=>{
    const row=raw as {portfolio_media?:{storage_path:string;[k:string]:unknown}[]};
    const media=await Promise.all((row.portfolio_media??[]).map(async m=>({...m,url:(await db.storage.from("portfolio").createSignedUrl(m.storage_path,1800)).data?.signedUrl??null})));
    return {...raw,portfolio_media:media};
  }));
}

export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("portfolios").select("id,title,description,completed_on,category_id,categories(slug,category_translations(locale,name)),portfolio_skills(skill_id),portfolio_media(id,storage_path,mime_type,media_type,thumbnail_path,sort_order)").eq("profile_id",user.id).order("created_at",{ascending:false});
  if(error)return NextResponse.json({error:"load_failed"},{status:400});
  return NextResponse.json(await signedMedia(db,(data??[]) as unknown as Record<string,unknown>[]));
}

export async function POST(req:NextRequest){
  try{
    const input=schema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {skillIds=[], ...record}=input;
    const {data,error}=await db.from("portfolios").insert({profile_id:user.id,title:record.title,description:record.description,category_id:record.categoryId??null,completed_on:record.completedOn??null}).select("id").single();
    if(error||!data)return NextResponse.json({error:"create_failed"},{status:400});
    if(skillIds.length){const {error:se}=await db.from("portfolio_skills").insert(skillIds.map(skill_id=>({portfolio_id:data.id,skill_id})));if(se)return NextResponse.json({error:"skills_failed",id:data.id},{status:400})}
    return NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PATCH(req:NextRequest){
  try{
    const input=schema.extend({id:z.string().uuid()}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {skillIds=[],id,...record}=input;
    const {error}=await db.from("portfolios").update({title:record.title,description:record.description,category_id:record.categoryId??null,completed_on:record.completedOn??null}).eq("id",id).eq("profile_id",user.id);
    if(error)return NextResponse.json({error:"update_failed"},{status:400});
    await db.from("portfolio_skills").delete().eq("portfolio_id",id);
    if(skillIds.length)await db.from("portfolio_skills").insert(skillIds.map(skill_id=>({portfolio_id:id,skill_id})));
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function DELETE(req:NextRequest){
  const id=req.nextUrl.searchParams.get("id"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!id)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data:media}=await db.from("portfolio_media").select("storage_path").eq("portfolio_id",id);
  const {error}=await db.from("portfolios").delete().eq("id",id).eq("profile_id",user.id);
  if(!error&&media?.length)await db.storage.from("portfolio").remove(media.map(x=>x.storage_path));
  return NextResponse.json({ok:!error},{status:error?400:200});
}
