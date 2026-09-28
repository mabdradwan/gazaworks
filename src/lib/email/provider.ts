import "server-only";
import {z} from "zod";
import type {EmailEnvelope,EmailProvider as OutboxProvider,EmailResult} from "@/domain/email";

export type TransactionalEmail={to:string;subject:string;text:string;replyTo?:string};
const idSchema=z.string().uuid();
const messageIdSchema=z.string().min(1).max(150).regex(/^[\x21-\x7e]+$/);

/** Brevo message IDs contain punctuation; the database stores a reversible safe encoding. */
export function encodeBrevoMessageId(raw:string){
 const normalized=raw.startsWith("<")&&raw.endsWith(">")?raw.slice(1,-1):raw;
 if(!messageIdSchema.safeParse(normalized).success)return null;
 return Buffer.from(normalized,"utf8").toString("base64url");
}

export function emailIsConfigured(){
 return Boolean(process.env.BREVO_API_KEY&&process.env.BREVO_SENDER_EMAIL&&process.env.CONTACT_RECIPIENT_EMAIL);
}

export class BrevoEmailProvider implements OutboxProvider{
 constructor(private readonly apiKey:string,private readonly sender:string,private readonly transport:typeof fetch=fetch){}
 async send(envelope:EmailEnvelope,idempotencyKey:string):Promise<EmailResult>{
  if(!idSchema.safeParse(idempotencyKey).success)return {status:"failed",code:"invalid_email_id"};
  try{
   const response=await this.transport("https://api.brevo.com/v3/smtp/email",{method:"POST",redirect:"error",headers:{"api-key":this.apiKey,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:this.sender,name:"GazaWorks"},to:[{email:envelope.to}],subject:envelope.subject,htmlContent:envelope.html,textContent:envelope.text,headers:{idempotencyKey}}),signal:AbortSignal.timeout(8000)});
   if(response.status===429||response.status===408||response.status>=500)return {status:"retry",code:`provider_http_${response.status}`};
   if(!response.ok){
    // An ambiguous earlier attempt may have been accepted. Preserve the queue for review.
    if(response.status===400){const error:unknown=await response.json().catch(()=>null);if(typeof error==="object"&&error!==null&&"code" in error&&error.code==="duplicate_parameter")return {status:"retry",code:"provider_duplicate"};}
    return {status:"failed",code:`provider_http_${response.status}`};
   }
   const body:unknown=await response.json().catch(()=>null);
   const raw=typeof body==="object"&&body!==null&&"messageId" in body&&typeof body.messageId==="string"?body.messageId:null;
   const providerId=raw?encodeBrevoMessageId(raw):null;
   return providerId?{status:"accepted",providerId}:{status:"retry",code:"provider_invalid_response"};
  }catch{return {status:"retry",code:"provider_network_error"};}
 }
}

export function emailProvider(){
 if(!emailIsConfigured())throw new Error("Transactional email is not configured");
 return {async send(message:TransactionalEmail){
  const to=z.string().email().parse(message.to),replyTo=message.replyTo?z.string().email().parse(message.replyTo):undefined;
  const response=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",redirect:"error",signal:AbortSignal.timeout(8000),headers:{"api-key":process.env.BREVO_API_KEY!,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:process.env.BREVO_SENDER_EMAIL,name:"GazaWorks"},to:[{email:to}],subject:message.subject,textContent:message.text,...(replyTo?{replyTo:{email:replyTo}}:{})})});
  if(response.status!==201)throw new Error("Email delivery request failed");
 }};
}
