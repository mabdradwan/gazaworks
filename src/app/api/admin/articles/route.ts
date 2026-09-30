import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {executeWorkflow} from "@/lib/workflows";

export async function GET(){
  const auth=await requirePermission("content.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("articles").select("id,slug,status,published_at,created_at,article_translations(locale,title,excerpt,body,seo)").order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  const auth=await requirePermission("content.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({slug:z.string().regex(/^[a-z0-9-]{1,100}$/),locale:z.enum(["ar","en","tr","es","fr","de"]),title:z.string().min(2).max(250),excerpt:z.string().max(1000).optional(),body:z.string().min(1).max(200000),status:z.enum(["draft","published"]).default("draft")}).parse(await req.json());
    return await executeWorkflow("gw_save_article",{
      slug:i.slug,language:i.locale,title:i.title,excerpt:i.excerpt??null,
      body:i.body,publication_status:i.status,
    },201);
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
