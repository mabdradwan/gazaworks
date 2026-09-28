import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {emailKinds} from "@/domain/email";
import {renderEmail} from "@/lib/email/templates";
import {executeWorkflow} from "@/lib/workflows";
import {supabaseAdmin} from "@/lib/supabase/admin";

const locale=z.enum(["ar","en","tr","es","fr","de"]);
const schema=z.object({key:z.enum(emailKinds),locale,subject:z.string().min(1).max(250),bodyHtml:z.string().min(1).max(100000),bodyText:z.string().max(100000).optional(),enabled:z.boolean().default(true)});

export async function GET(){
  const auth=await requirePermission("email.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("email_templates").select("*").order("key").order("locale");
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function POST(req:NextRequest){
  const auth=await requirePermission("email.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=schema.parse(await req.json());
    renderEmail({kind:i.key,locale:i.locale,recipient:"validation@example.test",from:"validation@example.test",origin:"https://example.test",template:{subject:i.subject,body_html:i.bodyHtml,body_text:i.bodyText??null,enabled:true}});
    return executeWorkflow("gw_save_email_template",{template_key:i.key,language:i.locale,subject:i.subject,body_html:i.bodyHtml,body_text:i.bodyText??null,enabled:i.enabled});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
