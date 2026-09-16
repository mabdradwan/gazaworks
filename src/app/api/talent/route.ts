import {directoryAccess} from "@/lib/directory";
import {NextRequest,NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(req:NextRequest){
  const session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
  const db=await directoryAccess();
  if(!db)return NextResponse.json({error:"client_required"},{status:403});
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});

  const q=(req.nextUrl.searchParams.get("q")??"").trim().toLowerCase().slice(0,100);
  const type=req.nextUrl.searchParams.get("type");
  const skillId=req.nextUrl.searchParams.get("skillId");
  const categoryId=req.nextUrl.searchParams.get("categoryId");
  const availability=(req.nextUrl.searchParams.get("availability")??"").trim().toLowerCase();
  const language=(req.nextUrl.searchParams.get("language")??"").trim().toLowerCase();
  const industry=(req.nextUrl.searchParams.get("industry")??"").trim().toLowerCase();
  const minExperience=Number(req.nextUrl.searchParams.get("minExperience")??0);
  const maxRate=Number(req.nextUrl.searchParams.get("maxRate")??0);
  const minRating=Number(req.nextUrl.searchParams.get("minRating")??0);

  const query=db.from("profiles").select("id,account_type,display_name,avatar_path,created_at,individual_profiles(professional_title,bio,availability,years_experience,hourly_rate_minor,currency,verification_status,featured,languages,preferred_fields),team_profiles(team_name,description,team_size,rate_minor,currency,verification_status,featured,services,expertise),profile_skills(skill_id,level),profile_details(kind,title),portfolios(id,title,description,category_id,completed_on,portfolio_media(id,storage_path,media_type,mime_type,thumbnail_path))").eq("account_status","active").in("account_type",type==="individual"||type==="team"?[type]:["individual","team"]).limit(150);

  const {data,error}=await query;
  if(error)return NextResponse.json({error:"search_failed"},{status:400});
  const ids=(data??[]).map(x=>x.id);

  const [reviewResult,projectResult]=await Promise.all([
    ids.length?db.from("reviews").select("subject_id,overall").in("subject_id",ids).eq("moderation_status","published"):Promise.resolve({data:[]}),
    ids.length?db.from("projects").select("talent_id,client_id,status").in("talent_id",ids):Promise.resolve({data:[]})
  ]);

  const ratings=new Map<string,{sum:number;n:number}>();
  for(const r of reviewResult.data??[]){if(!r.overall)continue;const v=ratings.get(r.subject_id)??{sum:0,n:0};v.sum+=r.overall;v.n++;ratings.set(r.subject_id,v)}
  const projects=new Map<string,{total:number;completed:number;clients:Set<string>}>();
  for(const p of projectResult.data??[]){const v=projects.get(p.talent_id)??{total:0,completed:0,clients:new Set<string>()};v.total++;if(["completed","payout_pending","paid"].includes(String(p.status)))v.completed++;if(p.client_id)v.clients.add(p.client_id);projects.set(p.talent_id,v)}

  const filtered=(data??[]).map(x=>{
    const ind=Array.isArray(x.individual_profiles)?x.individual_profiles[0]:x.individual_profiles;
    const team=Array.isArray(x.team_profiles)?x.team_profiles[0]:x.team_profiles;
    const r=ratings.get(x.id),p=projects.get(x.id);
    return {...x,rating:r?Math.round((r.sum/r.n)*10)/10:null,review_count:r?.n??0,project_count:p?.total??0,completed_count:p?.completed??0,repeat_client_count:p?Math.max(0,p.total-p.clients.size):0,ind,team};
  }).filter(x=>{
    if(String(x.ind?.verification_status??x.team?.verification_status)!=="verified")return false;
    const text=[x.display_name,x.ind?.professional_title,x.ind?.bio,x.team?.team_name,x.team?.description,...((x.ind?.preferred_fields as string[]|undefined)??[]),...((x.team?.services as string[]|undefined)??[]),...((x.team?.expertise as string[]|undefined)??[])].filter(Boolean).join(" ").toLowerCase();
    if(q&&!text.includes(q))return false;
    if(skillId&&!(x.profile_skills??[]).some(s=>s.skill_id===skillId))return false;
    if(categoryId&&!(x.portfolios??[]).some(p=>p.category_id===categoryId))return false;
    if(minExperience&&Number(x.ind?.years_experience??0)<minExperience)return false;
    const rate=Number(x.ind?.hourly_rate_minor??x.team?.rate_minor??0);if(maxRate&&rate>maxRate)return false;
    if(minRating&&Number(x.rating??0)<minRating)return false;
    if(availability&&String(x.ind?.availability??"").toLowerCase()!==availability)return false;
    const langs=Array.isArray(x.ind?.languages)?x.ind?.languages.map(String):[];if(language&&!langs.some(v=>v.toLowerCase().includes(language)))return false;
    if(industry&&!(x.profile_details??[]).some(d=>d.kind==="industry"&&String(d.title??"").toLowerCase().includes(industry)))return false;
    return true;
  });

  const rows=await Promise.all(filtered.map(async x=>{
    const avatar=x.avatar_path?(await db.storage.from("avatars").createSignedUrl(x.avatar_path,1800)).data?.signedUrl??null:null;
    const portfolios=await Promise.all((x.portfolios??[]).map(async p=>({
      ...p,
      portfolio_media:await Promise.all((p.portfolio_media??[]).map(async m=>({...m,url:(await db.storage.from("portfolio").createSignedUrl(m.storage_path,1800)).data?.signedUrl??null})))
    })));
    const {ind,team,...safe}=x;
    return {...safe,avatar_url:avatar,individual_profiles:ind??null,team_profiles:team??null,portfolios};
  }));

  return NextResponse.json(rows);
}

