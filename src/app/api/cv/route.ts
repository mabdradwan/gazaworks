import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {generateDraft} from "@/lib/ai/generate";
import {AIUnavailable} from "@/lib/ai/provider";
import {cvSchema,cvFieldKeys} from "@/domain/cv";
import {parseDraftJSON} from "@/domain/profile-draft";
const schema=z.object({cv:cvSchema,locale:z.enum(["ar","en","tr","es","fr","de"]),template:z.enum(["classic","modern"]).default("classic")});
export async function GET(){
 const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 const {data,error}=await db.from("profile_drafts").select("id,extracted_data").eq("profile_id",user.id).eq("source_kind","cv_builder").not("confirmed_at","is",null).order("created_at",{ascending:false}).limit(1).maybeSingle();
 return error?NextResponse.json({error:"load_failed"},{status:500}):NextResponse.json(data?.extracted_data??null);
}
export async function PUT(req:NextRequest){
 try{
  const input=schema.extend({confirmed:z.literal(true)}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const document={cv:input.cv,locale:input.locale,template:input.template};
  const {data,error}=await db.from("profile_drafts").insert({profile_id:user.id,source_kind:"cv_builder",extracted_data:document,rewrite_mode:"user_confirmed",confirmed_at:new Date().toISOString()}).select("id").single();
  return error?NextResponse.json({error:"save_failed"},{status:400}):NextResponse.json(data,{status:201});
 }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
export async function POST(req:NextRequest){
 try{
  const input=schema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  if(!input.cv.name||!input.cv.title)return NextResponse.json({error:"name_and_title_required"},{status:400});
  const result=await generateDraft(user.id,{task:"cv_builder",locale:input.locale,json:true,prompt:`Rewrite this CV professionally in the requested language using ONLY the supplied facts. Return a JSON object with exactly these string fields: ${cvFieldKeys.join(", ")}. Preserve names, companies, dates and qualifications. Never invent work, measurable achievements or credentials. Leave missing sections empty.`,grounding:input.cv});
  const cv=cvSchema.parse(parseDraftJSON(result.text));
  return NextResponse.json({cv,generationId:result.generationId,requiresConfirmation:true});
 }catch(e){return NextResponse.json({error:e instanceof AIUnavailable?e.message:"cv_generation_failed"},{status:503})}
}
