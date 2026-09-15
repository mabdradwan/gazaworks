import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

const locale=z.enum(["ar","en","tr","es","fr","de"]);
const schema=z.object({key:z.string().regex(/^[a-z0-9_-]+$/).min(2).max(100),locale,subject:z.string().min(1).max(250),bodyHtml:z.string().min(1).max(100000),bodyText:z.string().max(100000).optional(),enabled:z.boolean().default(true)});

export async function GET(){
  const auth=await requirePermission("email.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("email_templates").select("*").order("key").order("locale");
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function POST(req:NextRequest){
  const auth=await requirePermission("email.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{const i=schema.parse(await req.json());const {error}=await supabaseAdmin().from("email_templates").upsert({key:i.key,locale:i.locale,subject:i.subject,body_html:i.bodyHtml,body_text:i.bodyText??null,enabled:i.enabled,updated_by:auth.user.id,updated_at:new Date().toISOString()},{onConflict:"key,locale"});return NextResponse.json({ok:!error},{status:error?400:200})}catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
