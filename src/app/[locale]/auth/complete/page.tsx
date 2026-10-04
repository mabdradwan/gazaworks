import {redirect} from "next/navigation";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {CompleteAccount} from "@/components/forms/complete-account";
import {safeReturnPath} from "@/domain/navigation";
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{next?:string}>}){
 const {locale}=await params,query=await searchParams,db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
 if(!user)redirect(`/${locale}/auth`);
 const {data:profile}=await supabaseAdmin().from("profiles").select("id").eq("id",user.id).maybeSingle();
 const next=safeReturnPath(query.next,locale);if(profile)redirect(next);
 return <section className="container auth-page"><CompleteAccount locale={locale} next={next} name={String(user.user_metadata?.full_name??user.user_metadata?.name??user.email?.split("@")[0]??"")}/></section>;
}
