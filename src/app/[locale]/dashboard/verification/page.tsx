import {VerificationFlow} from "@/components/forms/verification-flow";
import {appointmentCopy} from "@/lib/appointment-copy";
import {VerificationDocuments} from "@/components/forms/verification-documents";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;const c=appointmentCopy(locale);return <section className="workspace-page"><div className="page-heading"><h1>{c.statusTitle}</h1><p className="muted">{c.intro}</p></div><VerificationDocuments locale={locale}/><VerificationFlow locale={locale}/></section>}
