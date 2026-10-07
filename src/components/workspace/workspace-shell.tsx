import {AccountTypeModal} from "@/components/forms/account-type-modal";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {redirect} from "next/navigation";
import {supabaseServer} from "@/lib/supabase/server";
import {workspaceCopy} from "@/lib/workspace-copy";

export async function WorkspaceShell({locale,children}:{locale:string;children:React.ReactNode}){
  const c=workspaceCopy(locale),db=await supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect(`/${locale}/auth`);
  const {data:profile,error}=await supabaseAdmin().from("profiles").select("account_type,display_name,onboarding_complete,account_status").eq("id",user.id).maybeSingle();if(error)throw new Error("profile_unavailable");if(!profile)return <div className="workspace-page"><h1>{c.label("Projects")}</h1><AccountTypeModal locale={locale} name={String(user.user_metadata?.full_name??user.email?.split("@")[0]??"GazaWorks user")}/></div>;
  if(profile.account_status!=="active")redirect(`/${locale}/auth?error=account_unavailable`);
  // Staff accounts without a marketplace profile belong only in the admin console.
  if(profile.account_type==="client"){
    const [staff,client]=await Promise.all([
      db.from("admin_roles").select("role_id").eq("profile_id",user.id).limit(1).maybeSingle(),
      db.from("client_profiles").select("profile_id").eq("profile_id",user.id).maybeSingle()
    ]);
    if(!staff.error&&!client.error&&staff.data&&!client.data)redirect(`/${locale}/admin`);
  }
  return <div className="workspace-layout unified-workspace"><div className="workspace-main">{children}</div></div>
}
