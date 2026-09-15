import {WorkspaceOverview} from "@/components/workspace/workspace-overview";
import {AIAssistant} from "@/components/ai-assistant";
export const metadata={robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  return <><WorkspaceOverview locale={locale}/><section className="workspace-page" style={{paddingTop:0}}><AIAssistant locale={locale}/></section></>
}
