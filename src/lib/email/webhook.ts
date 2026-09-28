import {createHash,timingSafeEqual} from "node:crypto";
/** Brevo sends the configured bearer token, rather than a payload signature. */
export function verifyEmailWebhook(headers:Headers,secret:string){
 if(secret.length<32||secret.length>200)return false;
 const actual=headers.get("authorization");
 if(!actual||!actual.startsWith("Bearer "))return false;
 const a=Buffer.from(actual.slice(7)),b=Buffer.from(secret);
 return a.length===b.length&&timingSafeEqual(a,b);
}
export function emailWebhookEventId(body:string){return createHash("sha256").update(body).digest("hex");}
export async function boundedWebhookBody(request:Request){
 if(Number(request.headers.get("content-length")??0)>65536)throw new Error("webhook_too_large");
 const reader=request.body?.getReader();if(!reader)throw new Error("missing_body");
 const chunks:Uint8Array[]=[];let length=0;
 try{while(true){const next=await reader.read();if(next.done)break;length+=next.value.length;if(length>65536){await reader.cancel();throw new Error("webhook_too_large");}chunks.push(next.value);}}finally{reader.releaseLock();}
 return Buffer.concat(chunks).toString("utf8");
}
