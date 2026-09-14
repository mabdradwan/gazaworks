import {NextRequest,NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(req:NextRequest){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const q=(req.nextUrl.searchParams.get("q")??"").trim().toLowerCase().slice(0,100);
  const type=req.nextUrl.searchParams.get("type");
  const skillId=req.nextUrl.searchParams.get("skillId");
  const minExperience=Number(req.nextUrl.searchParams.get("minExperience")??0);
  const maxRate=Number(req.nextUrl.searchParams.get("maxRate")??0);
  const query=db.from("profiles").select("id,account_type,display_name,avatar_path,individual_profiles(professional_title,bio,availability,years_experience,hourly_rate_minor,currency,verification_status,featured),team_profiles(team_name,description,team_size,rate_minor,currency,verification_status,featured),profile_skills(skill_id,level),portfolios(id,title,description,portfolio_media(id,storage_path,media_type,thumbnail_path))").in("account_type",type==="individual"||type==="team"?[type]:["individual","team"]).limit(100);
  const {data,error}=await query;
  if(error)return NextResponse.json({error:"search_failed"},{status:400});
  const ids=(data??[]).map(x=>x.id);
  const reviewResult=ids.length?await db.from("reviews").select("subject_id,overall").in("subject_id",ids).eq("moderation_status","published"):{data:[]};
  const ratings=new Map<string,{sum:number;n:number}>();
  for(const r of reviewResult.data??[]){
    if(!r.overall)continue;
    const cur=ratings.get(r.subject_id)??{sum:0,n:0};cur.sum+=r.overall;cur.n++;ratings.set(r.subject_id,cur);
  }
  const rows=(data??[]).filter(x=>{
    const ind=Array.isArray(x.individual_profiles)?x.individual_profiles[0]:x.individual_profiles;
    const team=Array.isArray(x.team_profiles)?x.team_profiles[0]:x.team_profiles;
    const text=[x.display_name,ind?.professional_title,ind?.bio,team?.team_name,team?.description].filter(Boolean).join(" ").toLowerCase();
    if(q&&!text.includes(q))return false;
    if(skillId&&!(x.profile_skills??[]).some(s=>s.skill_id===skillId))return false;
    if(minExperience&&Number(ind?.years_experience??0)<minExperience)return false;
    const rate=Number(ind?.hourly_rate_minor??team?.rate_minor??0);
    if(maxRate&&rate>maxRate)return false;
    return true;
  }).map(x=>{const r=ratings.get(x.id);return {...x,rating:r?Math.round((r.sum/r.n)*10)/10:null,review_count:r?.n??0}});
  return NextResponse.json(rows);
}
