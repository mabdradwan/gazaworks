import {directoryAccess} from "@/lib/directory";
import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {aiProvider} from "@/lib/ai/provider";
import {rateLimit} from "@/lib/security";

export async function POST(req:NextRequest){
  if(!rateLimit("talent-ai:"+(req.headers.get("x-forwarded-for")??"local"),6))return NextResponse.json({error:"rate_limited"},{status:429});
  try{
    const input=z.object({prompt:z.string().min(5).max(2000),locale:z.enum(["ar","en","tr","es","fr","de"])}).parse(await req.json());
    const session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
  const db=await directoryAccess();
  if(!db)return NextResponse.json({error:"client_required"},{status:403});
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data,error}=await db.from("profiles").select("id,account_type,display_name,individual_profiles(professional_title,bio,availability,years_experience,hourly_rate_minor,currency,verification_status),team_profiles(team_name,description,team_size,rate_minor,currency,verification_status),profile_skills(skill_id,level,skills(slug,skill_translations(locale,name)))").eq("account_status","active").in("account_type",["individual","team"]).limit(80);
    if(error)return NextResponse.json({error:"talent_unavailable"},{status:400});
    const grounding=(data??[]).map(x=>({
      id:x.id,type:x.account_type,name:x.display_name,
      individual:Array.isArray(x.individual_profiles)?x.individual_profiles[0]:x.individual_profiles,
      team:Array.isArray(x.team_profiles)?x.team_profiles[0]:x.team_profiles,
      skills:x.profile_skills
    })).filter(x=>String(x.individual?.verification_status??x.team?.verification_status)==="verified");
    const result=await aiProvider().complete({
      task:"talent_search",locale:input.locale,prompt:input.prompt,
      grounding:{instruction:"Recommend only IDs present in candidates. Explain concise match reasons. Never invent skills, reviews, location or availability.",candidates:grounding}
    });
    await db.from("ai_interactions").insert({profile_id:user.id,task:"talent_search",provider:result.provider,model:result.model,input_hash:"server-grounded-talent-search",grounding_ids:grounding.map(x=>x.id),response:result.text,status:"draft"});
    return NextResponse.json({...result,candidateCount:grounding.length,grounded:true});
  }catch(e){return NextResponse.json({error:e instanceof z.ZodError?"invalid_request":"service_unavailable"},{status:e instanceof z.ZodError?400:503})}
}

