import {VerificationFlow} from "@/components/forms/verification-flow";
export const metadata={robots:{index:false}};
export default function Page(){
  return <section className="workspace-page">
    <div className="page-heading"><span className="badge">In-person verification</span><h1>Verification appointments</h1><p className="muted">After submitting your verification request, choose an available GazaWorks interview slot. The appointment is reviewed by GazaWorks staff, not AI.</p></div>
    <VerificationFlow/>
  </section>
}
