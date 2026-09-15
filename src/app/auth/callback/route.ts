import {NextRequest,NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {recordLoginEvent,requestNetworkMetadata} from "@/lib/security-events";
import {isLocale} from "@/lib/i18n";
import type {AccountType} from "@/domain/marketplace";

const accountTypes=new Set<AccountType>(["individual","team","client"]);

function safeNext(value:string|null,locale:string){
  if(!value||!value.startsWith("/")||value.startsWith("//"))return "/"+locale+"/dashboard";
  return value;
}

export async function GET(request:NextRequest){
  const code=request.nextUrl.searchParams.get("code");
  const localeParam=request.nextUrl.searchParams.get("locale")??"en";
  const locale=isLocale(localeParam)?localeParam:"en";
  const next=safeNext(request.nextUrl.searchParams.get("next"),locale);
  if(!code)return NextResponse.redirect(new URL("/"+locale+"/auth?error=callback",request.url));

  const db=await supabaseServer();
  const {error}=await db.auth.exchangeCodeForSession(code);
  if(error)return NextResponse.redirect(new URL("/"+locale+"/auth?error=callback",request.url));

  const {data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.redirect(new URL("/"+locale+"/auth?error=callback",request.url));

  const admin=supabaseAdmin();
  const {data:profile}=await admin.from("profiles").select("id,account_type").eq("id",user.id).maybeSingle();

  if(!profile){
    const raw=request.nextUrl.searchParams.get("accountType");
    if(!raw||!accountTypes.has(raw as AccountType)){
      await db.auth.signOut();
      return NextResponse.redirect(new URL("/"+locale+"/auth?error=account_type_required",request.url));
    }
    const accountType=raw as AccountType;
    const meta=user.user_metadata??{};
    const displayName=String(meta.full_name??meta.name??meta.display_name??user.email?.split("@")[0]??"GazaWorks user").slice(0,100);

    const {error:profileError}=await admin.from("profiles").insert({
      id:user.id,
      account_type:accountType,
      display_name:displayName,
      locale
    });
    if(profileError)return NextResponse.redirect(new URL("/"+locale+"/auth?error=profile_provisioning",request.url));

    if(accountType==="individual"){
      await admin.from("individual_profiles").insert({profile_id:user.id,email_private:user.email??null});
    }else if(accountType==="team"){
      await admin.from("team_profiles").insert({profile_id:user.id,team_name:displayName});
    }else{
      await admin.from("client_profiles").insert({profile_id:user.id,full_name:displayName,country_code:"ZZ"});
    }
  }

  const {ip,userAgent}=requestNetworkMetadata(request.headers);
  await recordLoginEvent({
    profileId:user.id,
    provider:String(user.app_metadata?.provider??"oauth"),
    ip,
    userAgent,
    metadata:{source:"oauth_callback"}
  });

  return NextResponse.redirect(new URL(next,request.url));
}
