import type {EmailEnvelope,EmailProvider,EmailResult} from "@/domain/email";
/** Credentials are supplied only by the server worker. */
export class ResendEmailProvider implements EmailProvider{
 constructor(private readonly apiKey:string,private readonly transport:typeof fetch=fetch){}
 async send(envelope:EmailEnvelope,idempotencyKey:string):Promise<EmailResult>{
  try{
   const response=await this.transport("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${this.apiKey}`,"Content-Type":"application/json","Idempotency-Key":idempotencyKey},body:JSON.stringify({...envelope,to:[envelope.to]}),signal:AbortSignal.timeout(8000)});
   if(response.status===429||response.status===408||response.status>=500)return {status:"retry",code:`provider_http_${response.status}`};
   if(!response.ok)return {status:"failed",code:`provider_http_${response.status}`};
   const body:unknown=await response.json();
   if(typeof body!=="object"||body===null||!("id" in body)||typeof body.id!=="string"||!/^[a-zA-Z0-9_-]{1,200}$/.test(body.id))return {status:"retry",code:"provider_invalid_response"};
   return {status:"accepted",providerId:body.id};
  }catch{return {status:"retry",code:"provider_network_error"};}
 }
}
