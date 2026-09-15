import {redirect} from "next/navigation";
import {WorkspaceOverview} from "@/components/workspace/workspace-overview";
import {AIAssistant} from "@/components/ai-assistant";
import {supabaseServer} from "@/lib/supabase/server";

export const metadata={robots:{index:false,follow:false}};

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  const db=await supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect(`/${locale}/auth`);
  const {data:profile}=await db.from("profiles").select("onboarding_complete,account_type").eq("id",user.id).single();
  if(profile && !profile.onboarding_complete) redirect(`/${locale}/dashboard/profile`);
  return <><WorkspaceOverview locale={locale}/><section className="workspace-page" style={{paddingTop:0}}><AIAssistant locale={locale}/></section></>;
}
