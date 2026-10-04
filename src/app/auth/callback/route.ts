import {NextRequest,NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {recordLoginEvent,requestNetworkMetadata} from "@/lib/security-events";
import {isLocale} from "@/lib/i18n";
import type {AccountType} from "@/domain/marketplace";
import {AI_CONSENT_VERSION,aiConsentMetadata} from "@/lib/ai/consent-policy";
import {safeReturnPath} from "@/domain/navigation";

const accountTypes=new Set<AccountType>(["individual","team","client"]);

// Relative redirects keep the user's browser on its original public origin,
// even when the hosting adapter supplies an internal deployment URL.
function authRedirect(path:string){
  return new NextResponse(null,{status:303,headers:{location:path,"Cache-Control":"no-store"}});
}

export async function GET(request:NextRequest){
  const code=request.nextUrl.searchParams.get("code");
  const localeParam=request.nextUrl.searchParams.get("locale")??"en";
  const locale=isLocale(localeParam)?localeParam:"en";
  const next=safeReturnPath(request.nextUrl.searchParams.get("next"),locale);
  if(!code)return authRedirect("/"+locale+"/auth?error=callback");

  const db=await supabaseServer();
  const {error}=await db.auth.exchangeCodeForSession(code);
  if(error)return authRedirect("/"+locale+"/auth?error=callback");

  const {data:{user}}=await db.auth.getUser();
  if(!user)return authRedirect("/"+locale+"/auth?error=callback");

  const admin=supabaseAdmin();
  const {data:profile,error:profileReadError}=await admin.from("profiles").select("id,account_type,account_status").eq("id",user.id).maybeSingle();
  if(profileReadError)return authRedirect("/"+locale+"/auth?error=profile_provisioning");

  if(profile&&profile.account_status!=="active"){await db.auth.signOut();return authRedirect("/"+locale+"/auth?error=account_unavailable");}

  if(!profile){
    const raw=request.nextUrl.searchParams.get("accountType");
    if(!raw||!accountTypes.has(raw as AccountType)){
      const query=new URLSearchParams({next});
      return authRedirect("/"+locale+"/auth/complete?"+query);
    }
    const accountType=raw as AccountType;
    const meta=user.user_metadata??{};
    const displayName=String(meta.full_name??meta.name??meta.display_name??user.email?.split("@")[0]??"GazaWorks user").slice(0,100);

    const {error:profileError}=await admin.rpc("gw_provision_profile",{actor:user.id,kind:accountType,display_name:displayName.length>=2?displayName:"GazaWorks user",locale,email:user.email??null});
    if(profileError)return authRedirect("/"+locale+"/auth?error=profile_provisioning");
  }

  if(request.nextUrl.searchParams.get("aiConsent")===AI_CONSENT_VERSION&&!user.user_metadata?.external_ai_consent_declined_at){
    const {error:consentError}=await db.auth.updateUser({data:aiConsentMetadata(true)});
    if(consentError)return authRedirect("/"+locale+"/auth?error=consent_save");
  }
  const {ip,userAgent}=requestNetworkMetadata(request.headers);
  await recordLoginEvent({
    profileId:user.id,
    provider:String(user.app_metadata?.provider??"oauth"),
    ip,
    userAgent,
    metadata:{source:"oauth_callback"}
  });

  return authRedirect(next);
}
