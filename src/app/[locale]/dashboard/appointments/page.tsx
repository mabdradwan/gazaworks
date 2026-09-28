import {VerificationFlow} from "@/components/forms/verification-flow";
import {appointmentCopy} from "@/lib/appointment-copy";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;const c=appointmentCopy(locale);return <section className="workspace-page"><div className="page-heading"><h1>{c.title}</h1><p className="muted">{c.intro}</p></div><VerificationFlow locale={locale}/></section>}
