import {notFound} from "next/navigation";
import {direction,isLocale} from "@/lib/i18n";
import {Header,Footer} from "@/components/site";
import {supabaseServer} from "@/lib/supabase/server";

export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  let signedIn=false;
  if(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY){
   const db=await supabaseServer();
   const {data:{user}}=await db.auth.getUser();
   signedIn=Boolean(user);
  }
  return <html lang={locale} dir={direction(locale)}><body><Header locale={locale} signedIn={signedIn}/><main>{children}</main><Footer locale={locale}/></body></html>
}

