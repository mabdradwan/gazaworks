import {redirect} from 'next/navigation';
import {supabaseServer} from '@/lib/supabase/server';
import {accountSettingsCopy} from '@/lib/account-settings-copy';
import {workspaceCopy} from '@/lib/workspace-copy';
import {VerificationDocuments} from '@/components/forms/verification-documents';
import {VerificationFlow} from '@/components/forms/verification-flow';
import {SecurityHistory} from '@/components/workspace/security-history';
import {AccountSettings} from '@/components/forms/account-settings';
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params,c=accountSettingsCopy(locale),w=workspaceCopy(locale),db=await supabaseServer();
 const {data:{user}}=await db.auth.getUser();if(!user)redirect(`/${locale}/auth`);
 const {data:profile,error}=await db.from('profiles').select('display_name,account_type,account_status').eq('id',user.id).single();
 if(error||!profile||profile.account_status!=='active')redirect(`/${locale}/auth`);
 const individual=profile.account_type==='individual';
 const {data:details}=individual?await db.from('individual_profiles').select('date_of_birth_private').eq('profile_id',user.id).single():{data:null};
 return <section className="workspace-page"><div className="page-heading"><h1>{w.label("Profile")}</h1><p className="muted">{c.description}</p></div><AccountSettings locale={locale} account={{name:profile.display_name,birth:details?.date_of_birth_private??null,individual,email:user.email??'',pendingEmail:user.new_email??'',google:!!user.identities?.some(i=>i.provider==='google'),typeLabel:individual?w.individual:profile.account_type==='team'?w.team:w.client}}/>{profile.account_type!=="client"&&<><VerificationDocuments locale={locale}/><VerificationFlow locale={locale}/></>}<SecurityHistory locale={locale}/></section>;
}
