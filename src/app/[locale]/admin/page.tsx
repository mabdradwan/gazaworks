import {Dashboard} from "@/components/app-shell";
import {AdminConsole} from "@/components/admin/admin-console";
export const metadata={robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{module?:string}>}){
  const {locale}=await params;const {module="Overview"}=await searchParams;
  return <div><Dashboard locale={locale} adminMode/><section className="container" style={{padding:"0 0 48px"}}><AdminConsole module={module} locale={locale}/></section></div>
}
