import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {executeWorkflow} from "@/lib/workflows";

export async function GET(){
  const auth=await requirePermission("content.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("site_pages").select("id,slug,status,updated_at,site_translations(locale,title,content,seo)").order("slug");
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  const auth=await requirePermission("content.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({slug:z.string().regex(/^[a-z0-9-]{1,100}$/),locale:z.enum(["ar","en","tr","es","fr","de"]),title:z.string().min(2).max(200),body:z.string().max(100000),status:z.enum(["draft","published"]).default("draft")}).parse(await req.json());
    return await executeWorkflow("gw_save_site_page",{
      slug:i.slug,language:i.locale,title:i.title,body:i.body,publication_status:i.status,
    },201);
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
