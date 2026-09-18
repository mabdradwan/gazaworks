import {notFound,redirect} from "next/navigation";
import {Dashboard} from "@/components/app-shell";
import {AdminConsole} from "@/components/admin/admin-console";
import {adminModules,type AdminModule} from "@/lib/admin-copy";
import {supabaseServer} from "@/lib/supabase/server";
export const metadata={robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{module?:string}>}){
 const [{locale},{module="Overview"}]=await Promise.all([params,searchParams]);
 if(!adminModules.some(value=>value===module))notFound();
 const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
 if(!user)redirect(`/${locale}/auth`);
 const [profile,roles]=await Promise.all([db.from("profiles").select("account_status").eq("id",user.id).single(),db.from("admin_roles").select("role_id").eq("profile_id",user.id).limit(1)]);
 if(profile.data?.account_status!=="active"||!roles.data?.length)redirect(`/${locale}/dashboard`);
 return <Dashboard locale={locale} module={module as AdminModule}><AdminConsole module={module} locale={locale}/></Dashboard>;
}
