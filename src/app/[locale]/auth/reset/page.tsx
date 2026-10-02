import {notFound} from "next/navigation";
import {ResetPasswordForm} from "@/components/forms/reset-password-form";
import {authRuntimeReady} from "@/domain/auth-readiness";
import {isLocale} from "@/lib/i18n";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {supabaseServer} from "@/lib/supabase/server";

export default async function Reset({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{mode?:string|string[]}>}) {
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const query=await searchParams;
  const mode=query.mode==="update"?"update":"request";
  const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY);
  const enabled=await authRuntimeReady(configured,async()=>{
    const {data,error}=await supabaseAdmin().rpc("gw_auth_runtime_ready");
    return !error&&data===true;
  });
  let sessionReady=false;
  if(enabled&&mode==="update") {
    const db=await supabaseServer();
    const {data,error}=await db.auth.getUser();
    sessionReady=!error&&Boolean(data.user);
  }
  return <section className="container auth-wrap"><ResetPasswordForm locale={locale} mode={mode} enabled={enabled} sessionReady={sessionReady}/></section>;
}
