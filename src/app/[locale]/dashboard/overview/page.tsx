import {redirect} from "next/navigation";
import {WorkspaceOverview} from "@/components/workspace/workspace-overview";
import {OverviewSections} from "@/components/workspace/overview-sections";
import {supabaseServer} from "@/lib/supabase/server";

export const metadata={robots:{index:false,follow:false}};

export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{section?:string}>}){
  const {locale}=await params;
  const query=await searchParams;
  const db=await supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect(`/${locale}/auth`);

  return <><WorkspaceOverview locale={locale}/><section className="workspace-page" style={{paddingTop:0}}><OverviewSections locale={locale} initialTab={query.section}/></section></>;
}
