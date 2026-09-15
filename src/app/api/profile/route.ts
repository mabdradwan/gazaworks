import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const schema=z.object({
  displayName:z.string().trim().min(2).max(100),
  professionalTitle:z.string().trim().max(120).optional(),
  bio:z.string().trim().max(4000).optional(),
  location:z.string().trim().max(120).optional(),
  availability:z.string().trim().max(80).optional(),
  yearsExperience:z.number().int().min(0).max(80).optional(),
  legalName:z.string().trim().max(160).optional(),
  phonePrivate:z.string().trim().max(80).optional(),
  emailPrivate:z.string().trim().email().max(180).optional().or(z.literal("")),
  hourlyRateMinor:z.number().int().min(0).max(100000000).optional(),
  currency:z.enum(["USD","EUR","TRY","ILS"]).optional(),
  languages:z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  tools:z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  dateOfBirth:z.string().date().optional().or(z.literal("")),
  preferredFields:z.array(z.string().trim().min(1).max(120)).max(30).optional(),
  linkedinUrl:z.string().url().max(500).optional().or(z.literal("")),
  websiteUrl:z.string().url().max(500).optional().or(z.literal("")),
  education:z.array(z.string().trim().min(1).max(500)).max(30).optional(),
  experience:z.array(z.string().trim().min(1).max(1000)).max(50).optional(),
  skillIds:z.array(z.string().uuid()).max(80).optional(),
  countryCode:z.string().trim().length(2).optional(),
  companyName:z.string().trim().max(150).optional(),
  organizationType:z.string().trim().max(100).optional(),
  teamSize:z.number().int().min(1).max(1000).optional(),
  services:z.array(z.string().trim().min(1).max(150)).max(50).optional(),
  expertise:z.array(z.string().trim().min(1).max(150)).max(50).optional(),
  achievements:z.string().trim().max(5000).optional(),
  history:z.string().trim().max(5000).optional(),
  representativePrivate:z.string().trim().max(200).optional(),
  contactPrivate:z.string().trim().max(300).optional(),
  teamRateMinor:z.number().int().min(0).max(100000000).optional()
});

export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("profiles")
    .select("*,individual_profiles(*),team_profiles(*),client_profiles(*),profile_skills(skill_id,level)")
    .eq("id",user.id).single();
  return error?NextResponse.json({error:"not_found"},{status:404}):NextResponse.json(data);
}

export async function PATCH(req:NextRequest){
  try{
    const input=schema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data:p}=await db.from("profiles").select("account_type,account_status").eq("id",user.id).single();
    if(!p||p.account_status!=="active")return NextResponse.json({error:"forbidden"},{status:403});

    const commonReady=input.displayName.trim().length>=2;
    let ready=commonReady;

    if(p.account_type==="individual"){
      ready=ready&&Boolean(input.professionalTitle&&input.bio&&input.location&&input.availability);
      const {error}=await db.from("individual_profiles").update({
        legal_name:input.legalName||null,
        professional_title:input.professionalTitle||null,
        bio:input.bio||null,
        gaza_location:input.location||null,
        phone_private:input.phonePrivate||null,
        email_private:input.emailPrivate||null,
        availability:input.availability||null,
        years_experience:input.yearsExperience??null,
        hourly_rate_minor:input.hourlyRateMinor??null,
        currency:input.currency??"USD",
        languages:input.languages??[],
        tools:input.tools??[],
        education:input.education??[],
        experience:input.experience??[],
        date_of_birth_private:input.dateOfBirth||null,
        preferred_fields:input.preferredFields??[],
        linkedin_url:input.linkedinUrl||null,
        website_url:input.websiteUrl||null
      }).eq("profile_id",user.id);
      if(error)return NextResponse.json({error:"individual_profile_update_failed"},{status:400});
    }

    if(p.account_type==="team"){
      ready=ready&&Boolean(input.bio&&input.location&&input.teamSize);
      const {error}=await db.from("team_profiles").update({
        team_name:input.displayName,
        description:input.bio||null,
        gaza_location:input.location||null,
        team_size:input.teamSize??1,
        representative_private:input.representativePrivate||null,
        contact_private:input.contactPrivate||null,
        rate_minor:input.teamRateMinor??null,
        currency:input.currency??"USD",
        services:input.services??[],
        expertise:input.expertise??[],
        achievements:input.achievements||null,
        history:input.history||null,
        linkedin_url:input.linkedinUrl||null,
        website_url:input.websiteUrl||null
      }).eq("profile_id",user.id);
      if(error)return NextResponse.json({error:"team_profile_update_failed"},{status:400});
    }

    if(p.account_type==="client"){
      ready=ready&&Boolean(input.countryCode);
      const {error}=await db.from("client_profiles").update({
        full_name:input.displayName,
        country_code:input.countryCode?.toUpperCase(),
        company_name:input.companyName||null,
        organization_type:input.organizationType||null,
        phone_private:input.phonePrivate||null
      }).eq("profile_id",user.id);
      if(error)return NextResponse.json({error:"client_profile_update_failed"},{status:400});
    }

    if(p.account_type!=="client"&&input.skillIds){
      const {error:de}=await db.from("profile_skills").delete().eq("profile_id",user.id);
      if(de)return NextResponse.json({error:"skill_update_failed"},{status:400});
      if(input.skillIds.length){
        const {error:ie}=await db.from("profile_skills").insert(input.skillIds.map(skill_id=>({profile_id:user.id,skill_id,level:3})));
        if(ie)return NextResponse.json({error:"skill_update_failed"},{status:400});
      }
    }

    const {error:pe}=await db.from("profiles").update({
      display_name:input.displayName,
      onboarding_complete:ready,
      updated_at:new Date().toISOString()
    }).eq("id",user.id);
    if(pe)return NextResponse.json({error:"profile_update_failed"},{status:400});
    return NextResponse.json({ok:true,onboardingComplete:ready});
  }catch(e){
    return NextResponse.json({error:e instanceof z.ZodError?e.flatten():"update_failed"},{status:400});
  }
}
