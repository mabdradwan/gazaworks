import {NextRequest,NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {recordLoginEvent,requestNetworkMetadata} from "@/lib/security-events";
import {isLocale} from "@/lib/i18n";
import type {AccountType} from "@/domain/marketplace";
import {safeReturnPath} from "@/domain/navigation";

const accountTypes=new Set<AccountType>(["individual","team","client"]);

export async function GET(request:NextRequest){
  const code=request.nextUrl.searchParams.get("code");
  const localeParam=request.nextUrl.searchParams.get("locale")??"en";
  const locale=isLocale(localeParam)?localeParam:"en";
  const next=safeReturnPath(request.nextUrl.searchParams.get("next"),locale);
  if(!code)return NextResponse.redirect(new URL("/"+locale+"/auth?error=callback",request.url));

  const db=await supabaseServer();
  const {error}=await db.auth.exchangeCodeForSession(code);
  if(error)return NextResponse.redirect(new URL("/"+locale+"/auth?error=callback",request.url));

  const {data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.redirect(new URL("/"+locale+"/auth?error=callback",request.url));

  const admin=supabaseAdmin();
  const {data:profile,error:profileReadError}=await admin.from("profiles").select("id,account_type,account_status").eq("id",user.id).maybeSingle();
  if(profileReadError)return NextResponse.redirect(new URL("/"+locale+"/auth?error=profile_provisioning",request.url));

  if(profile&&profile.account_status!=="active"){await db.auth.signOut();return NextResponse.redirect(new URL("/"+locale+"/auth?error=account_unavailable",request.url));}

  if(!profile){
    const raw=request.nextUrl.searchParams.get("accountType");
    if(!raw||!accountTypes.has(raw as AccountType)){
      await db.auth.signOut();
      const query=new URLSearchParams({mode:"register",error:"account_type_required",next});
      return NextResponse.redirect(new URL("/"+locale+"/auth?"+query,request.url));
    }
    const accountType=raw as AccountType;
    const meta=user.user_metadata??{};
    const displayName=String(meta.full_name??meta.name??meta.display_name??user.email?.split("@")[0]??"GazaWorks user").slice(0,100);

    const {error:profileError}=await admin.rpc("gw_provision_profile",{actor:user.id,kind:accountType,display_name:displayName.length>=2?displayName:"GazaWorks user",locale,email:user.email??null});
    if(profileError)return NextResponse.redirect(new URL("/"+locale+"/auth?error=profile_provisioning",request.url));
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
