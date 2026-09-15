import {NextRequest,NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
export async function GET(req:NextRequest){
  const locale=req.nextUrl.searchParams.get("locale")??"en";
  const db=await supabaseServer();
  const {data,error}=await db.from("articles").select("id,slug,published_at,article_translations(locale,title,excerpt,body,seo)").eq("status","published").order("published_at",{ascending:false}).limit(100);
  if(error)return NextResponse.json({error:"load_failed"},{status:400});
  const rows=(data??[]).map(a=>{const all=a.article_translations??[];const t=all.find((x:{locale:string})=>x.locale===locale)??all.find((x:{locale:string})=>x.locale==="en")??all[0];return {id:a.id,slug:a.slug,published_at:a.published_at,translation:t??null}});
  return NextResponse.json(rows);
}
