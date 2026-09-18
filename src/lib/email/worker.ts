import "server-only";
import {emailConfiguration,emailEnvelopeSchema,type EmailJob,type EmailResult} from "@/domain/email";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {ResendEmailProvider} from "@/lib/email/provider";
import {renderEmail,type StoredEmailTemplate} from "@/lib/email/templates";

export async function runEmailWorker(){
 const config=emailConfiguration(process.env);
 if(!config)return {enabled:false,processed:0};
 const db=supabaseAdmin(),provider=new ResendEmailProvider(config.apiKey);
 const claimed=await db.rpc("gw_claim_emails",{batch_size:3});
 if(claimed.error)throw new Error("email_claim_failed");
 const jobs=(claimed.data??[]) as EmailJob[];
 let processed=0;
 for(const job of jobs){
  let result:EmailResult|{status:"suppressed";code:string};
  let envelope=job.envelope;
  if(!envelope){
   const template=await db.from("email_templates").select("subject,body_html,body_text,enabled").eq("key",job.kind).eq("locale",job.locale).maybeSingle();
   if(template.error)result={status:"retry",code:"template_load_failed"};
   else{
    try{
     envelope=renderEmail({kind:job.kind,locale:job.locale,recipient:job.recipient,from:config.from,origin:config.origin,template:(template.data as StoredEmailTemplate|null)??undefined});
     result=envelope?{status:"retry",code:"envelope_prepare_failed"}:{status:"suppressed",code:"template_disabled"};
    }catch{result={status:"failed",code:"email_render_failed"};}
   }
  }else result={status:"retry",code:"envelope_prepare_failed"};
  if(envelope){
   // Always recheck the destination immediately before sending, even on retries.
   const prepared=await db.rpc("gw_prepare_email",{outbox_id:job.id,token:job.claim_token,payload:envelope});
   if(prepared.error)result=prepared.error.message==="recipient_unavailable"?{status:"suppressed",code:"recipient_unavailable"}:{status:"retry",code:"envelope_prepare_failed"};
   else{
    const parsed=emailEnvelopeSchema.safeParse(prepared.data);
    result=parsed.success?await provider.send(parsed.data,`gazaworks-email/${job.id}`):{status:"failed",code:"invalid_saved_envelope"};
   }
  }
  const completed=await db.rpc("gw_finish_email",{outbox_id:job.id,token:job.claim_token,outcome:result.status,message_id:result.status==="accepted"?result.providerId:null,error_code:result.status==="accepted"?null:result.code});
  if(completed.error)throw new Error("email_finish_failed");
  processed++;
  // The default provider limit is two requests per second; 429 also retries.
  if(processed<jobs.length)await new Promise<void>(resolve=>setTimeout(resolve,600));
 }
 return {enabled:true,processed};
}
