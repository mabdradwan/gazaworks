import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("content.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("articles").select("id,slug,status,published_at,created_at,article_translations(locale,title,excerpt,body,seo)").order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  const auth=await requirePermission("content.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({slug:z.string().regex(/^[a-z0-9-]+$/),locale:z.string().min(2).max(5),title:z.string().min(2).max(250),excerpt:z.string().max(1000).optional(),body:z.string().min(1).max(200000),status:z.enum(["draft","published"]).default("draft")}).parse(await req.json());
    const admin=supabaseAdmin();
    const {data:a,error}=await admin.from("articles").upsert({slug:i.slug,status:i.status,author_id:auth.user.id,...(i.status==="published"?{published_at:new Date().toISOString()}:{})},{onConflict:"slug"}).select("id").single();
    if(error)return NextResponse.json({error:"save_failed"},{status:400});
    const {error:te}=await admin.from("article_translations").upsert({article_id:a.id,locale:i.locale,title:i.title,excerpt:i.excerpt,body:i.body},{onConflict:"article_id,locale"});
    return NextResponse.json({id:a.id,ok:!te},{status:te?400:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
