import {WorkspaceShell} from "@/components/workspace/workspace-shell";
export const metadata={robots:{index:false,follow:false}};
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
  const {locale}=await params;
  return <WorkspaceShell locale={locale}>{children}</WorkspaceShell>
}
