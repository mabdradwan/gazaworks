import {z} from "zod";
export const emailKinds=["verification_status","payment_confirmation","payout_status","dispute_update","appeal_update","security_alert","account_notice"] as const;
export type EmailKind=(typeof emailKinds)[number];
export const emailEnvelopeSchema=z.object({from:z.string().min(3).max(320).refine(v=>!/[\r\n]/.test(v)),to:z.string().email().max(320),subject:z.string().min(1).max(250).refine(v=>!/[\r\n]/.test(v)),html:z.string().min(1).max(100000),text:z.string().min(1).max(100000)}).strict();
export type EmailEnvelope=z.infer<typeof emailEnvelopeSchema>;
export type EmailResult={status:"accepted";providerId:string}|{status:"retry"|"failed";code:string};
export interface EmailProvider{send(envelope:EmailEnvelope,idempotencyKey:string):Promise<EmailResult>;}
export type EmailJob={id:string;claim_token:string;kind:EmailKind;locale:string;recipient:string;envelope:EmailEnvelope|null};
export function emailConfiguration(env:Record<string,string|undefined>){
 if(env.EMAIL_PROVIDER!=="brevo"||env.EMAIL_DELIVERY_ENABLED!=="true"||!env.BREVO_API_KEY||!env.BREVO_SENDER_EMAIL||!env.NEXT_PUBLIC_APP_URL)return null;
 if(env.CONTEXT!=="production"&&env.EMAIL_ALLOW_NON_PRODUCTION!=="true")return null;
 try{
  const origin=new URL(env.NEXT_PUBLIC_APP_URL);
  if(origin.protocol!=="https:"||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=="/")return null;
  if(!z.string().email().max(320).safeParse(env.BREVO_SENDER_EMAIL).success)return null;
  return {apiKey:env.BREVO_API_KEY,from:env.BREVO_SENDER_EMAIL,origin:origin.origin};
 }catch{return null;}
}
