import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("content.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("site_pages").select("id,slug,status,updated_at,site_translations(locale,title,content,seo)").order("slug");
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  const auth=await requirePermission("content.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({slug:z.string().regex(/^[a-z0-9-]+$/),locale:z.string().min(2).max(5),title:z.string().min(2).max(200),body:z.string().max(100000),status:z.enum(["draft","published"]).default("draft")}).parse(await req.json());const admin=supabaseAdmin();const {data:p,error}=await admin.from("site_pages").upsert({slug:i.slug,status:i.status,updated_at:new Date().toISOString()},{onConflict:"slug"}).select("id").single();if(error)return NextResponse.json({error:"save_failed"},{status:400});await admin.from("site_translations").upsert({page_id:p.id,locale:i.locale,title:i.title,content:{body:i.body}},{onConflict:"page_id,locale"});return NextResponse.json({id:p.id},{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
