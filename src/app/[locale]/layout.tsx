import "../navigation.css";
import {notFound} from "next/navigation";
import {direction,isLocale} from "@/lib/i18n";
import {NavigationFeedback} from "@/components/navigation-feedback";
import {Suspense} from "react";
import {FloatingAssistant} from "@/components/ai-assistant";
import {Header,Footer} from "@/components/site";
import {supabaseServer} from "@/lib/supabase/server";
import {enabledLocaleList} from "@/domain/locale-settings";
import type {Metadata} from "next";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  const descriptions={
    ar:"منصة تربط المواهب والفرق المهنية في غزة بعملاء وفرص عمل حول العالم.",
    en:"Connect with professional talent and teams in Gaza for work opportunities around the world.",
    tr:"Gazze'deki profesyonel yetenekleri ve ekipleri dünyanın dört bir yanındaki iş fırsatlarıyla buluşturan platform.",
    es:"Una plataforma que conecta talento y equipos profesionales de Gaza con oportunidades de trabajo en todo el mundo.",
    fr:"Une plateforme qui relie les talents et équipes de Gaza à des opportunités professionnelles dans le monde entier.",
    de:"Eine Plattform, die Fachkräfte und Teams in Gaza mit beruflichen Chancen weltweit verbindet."
  };
  return {title:{default:"GazaWorks",template:"%s | GazaWorks"},description:descriptions[isLocale(locale)?locale:"en"],icons:{icon:"/brand/gazaworks-mark-green.png"}};
}

export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const db=configured?await supabaseServer():null;
  const [auth,setting]=await Promise.all([
    db?.auth.getUser(),
    db?.from("settings").select("value").eq("key","supported_locales").eq("public",true).maybeSingle(),
  ]);
  const user=auth?.data.user;
  const enabledLocales=enabledLocaleList(setting?.data?.value);
  return (
    <html lang={locale} dir={direction(locale)}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@dawod/thmanyah-font-web@1.2.0/index.css" />
      </head>
      <body>
        <Header locale={locale} signedIn={Boolean(user)} enabledLocales={enabledLocales}/>
        <main>{children}</main>
        <Footer locale={locale}/>
        <Suspense fallback={null}><NavigationFeedback locale={locale}/></Suspense>
        <FloatingAssistant locale={locale}/>
      </body>
    </html>
  );
}
