import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {generateDraft} from "@/lib/ai/generate";
import {AIUnavailable} from "@/lib/ai/provider";
import {cvSchema,cvFieldKeys,mergeCV,validCVContact,hasReadableText,emptyCV} from "@/domain/cv";
import {targetLanguage} from "@/lib/ai/language";
import {parseDraftJSON} from "@/domain/profile-draft";
const schema=z.object({cv:cvSchema,locale:z.enum(["ar","en","tr","es","fr","de"]),template:z.enum(["classic","modern"]).default("classic"),versions:z.record(z.enum(["ar","en","tr","es","fr","de"]),cvSchema).optional(),mode:z.enum(["rewrite","translate","voice"]).default("rewrite"),transcript:z.string().max(25000).optional()});
export async function GET(){
 const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 const {data,error}=await db.from("profile_drafts").select("id,extracted_data").eq("profile_id",user.id).eq("source_kind","cv_builder").not("confirmed_at","is",null).order("created_at",{ascending:false}).limit(1).maybeSingle();
 if(error)return NextResponse.json({error:"load_failed"},{status:500});
 const {data:profile}=await db.from("profiles").select("display_name,locale,individual_profiles(professional_title,phone_private,email_private,linkedin_url,website_url)").eq("id",user.id).single();
 const details=(Array.isArray(profile?.individual_profiles)?profile?.individual_profiles[0]:profile?.individual_profiles) as {professional_title?:string;phone_private?:string;email_private?:string;linkedin_url?:string;website_url?:string}|undefined;
 const stored=(data?.extracted_data??{cv:{...emptyCV,name:profile?.display_name??'',title:details?.professional_title??''},locale:profile?.locale??'en',template:'classic'}) as {cv:Record<string,unknown>};
 return NextResponse.json({...stored,profileId:user.id,cv:{...stored.cv,phone:stored.cv.phone||details?.phone_private||'',email:stored.cv.email||details?.email_private||'',website:stored.cv.website||details?.website_url||'',linkedin:stored.cv.linkedin||details?.linkedin_url||''}});
}
export async function PUT(req:NextRequest){
 try{
  const input=schema.extend({confirmed:z.literal(true)}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  if(!validCVContact(input.cv))return NextResponse.json({error:"contact_required"},{status:400});
  const {data:previous}=await db.from("profile_drafts").select("extracted_data").eq("profile_id",user.id).eq("source_kind","cv_builder").not("confirmed_at","is",null).order("created_at",{ascending:false}).limit(1).maybeSingle();
  const old=previous?.extracted_data as {versions?:Record<string,unknown>;cv?:unknown;locale?:string}|undefined;
  const document={cv:input.cv,locale:input.locale,template:input.template,versions:{...(old?.versions??{}),...(input.versions??{}),...(old?.locale&&old.cv?{[old.locale]:old.cv}:{}),[input.locale]:input.cv}};
  const {data,error}=await db.from("profile_drafts").insert({profile_id:user.id,source_kind:"cv_builder",extracted_data:document,rewrite_mode:"user_confirmed",confirmed_at:new Date().toISOString()}).select("id").single();
  return error?NextResponse.json({error:"save_failed"},{status:400}):NextResponse.json(data,{status:201});
 }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
export async function POST(req:NextRequest){
 try{
  const input=schema.extend({consentToExternalAI:z.literal(true)}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  if(input.mode!=="voice"&&(!input.cv.name||!input.cv.title))return NextResponse.json({error:"name_and_title_required"},{status:400});
  const result=await generateDraft(user.id,{task:"cv_builder",locale:input.locale,json:true,prompt:`${targetLanguage(input.locale)} ${input.mode==="voice"?"Extract the user interview into matching CV fields. If answers are missing ask ONE clear follow-up question in nextQuestion, including contact phone and email. Return the CV fields and nextQuestion in the same JSON object. Do not mix education with summary or experience.":input.mode==="translate"?"Translate faithfully, without rewriting facts.":"Rewrite professionally."} Use ONLY the supplied facts. Return a JSON object with exactly these string fields: ${[...cvFieldKeys,"phone","email","website","linkedin"].join(", ")}. Preserve names, companies, dates and qualifications. Never invent work, measurable achievements or credentials. Translate every supplied non-empty section in full; never omit or blank an existing section. Leave genuinely missing sections empty. Return languages as language-code:level pairs, choosing levels native, excellent, very-good, good. Return software as comma-separated tool names.`,grounding:{cv:input.cv,interview:input.transcript??""}});
  const parsed=parseDraftJSON(result.text);const generated=cvSchema.parse(parsed);
  if(Object.values(generated).some(v=>!hasReadableText(v)))return NextResponse.json({error:"unreadable_ai_output"},{status:503});
  const cv=mergeCV(input.cv,generated);
  const editorial=[cv.summary,cv.experience,cv.education,cv.projects,cv.training,cv.certifications,cv.achievements,cv.goals].join(" ");
  if(input.locale!=="ar"&&(editorial.match(/[\u0600-\u06FF]/g)?.length??0)>Math.max(40,editorial.length*.2))return NextResponse.json({error:"translation_language_mismatch"},{status:503});
  return NextResponse.json({cv,generationId:result.generationId,requiresConfirmation:true,nextQuestion:input.mode==="voice"?z.object({nextQuestion:z.string().max(500).optional()}).parse(parsed).nextQuestion:undefined});
 }catch(e){return NextResponse.json({error:e instanceof z.ZodError?"invalid_request":e instanceof AIUnavailable?e.message:"cv_generation_failed"},{status:e instanceof z.ZodError?400:503})}
}
