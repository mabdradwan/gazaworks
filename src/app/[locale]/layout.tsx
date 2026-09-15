import {notFound} from "next/navigation";
import {direction,isLocale} from "@/lib/i18n";
import {Header,Footer} from "@/components/site";
import {supabaseServer} from "@/lib/supabase/server";

export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const db=await supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  return <html lang={locale} dir={direction(locale)}><body><Header locale={locale} signedIn={Boolean(user)}/><main>{children}</main><Footer locale={locale}/></body></html>
}
