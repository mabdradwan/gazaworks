import {createHmac,timingSafeEqual} from "node:crypto";
/** Svix's documented HMAC format over the unparsed HTTP body. */
export function verifyEmailWebhook(body:string,headers:Headers,secret:string,nowSeconds=Math.floor(Date.now()/1000)){
 const id=headers.get("svix-id"),timestamp=headers.get("svix-timestamp"),signatures=headers.get("svix-signature");
 if(!id||id.length>200||!timestamp||!/^\d{1,12}$/.test(timestamp)||!signatures||signatures.length>2048||!secret.startsWith("whsec_"))return false;
 if(Math.abs(nowSeconds-Number(timestamp))>300)return false;
 const key=Buffer.from(secret.slice(6),"base64");if(key.length<16)return false;
 const expected=createHmac("sha256",key).update(`${id}.${timestamp}.${body}`).digest();
 return signatures.split(" ").some(signature=>{const [version,value]=signature.split(",");if(version!=="v1"||!value||!/^[A-Za-z0-9+/]+={0,2}$/.test(value))return false;const actual=Buffer.from(value,"base64");return actual.length===expected.length&&timingSafeEqual(actual,expected);});
}
export async function boundedWebhookBody(request:Request){
 if(Number(request.headers.get("content-length")??0)>65536)throw new Error("webhook_too_large");
 const reader=request.body?.getReader();if(!reader)throw new Error("missing_body");
 const chunks:Uint8Array[]=[];let length=0;
 try{while(true){const next=await reader.read();if(next.done)break;length+=next.value.length;if(length>65536){await reader.cancel();throw new Error("webhook_too_large");}chunks.push(next.value);}}finally{reader.releaseLock();}
 return Buffer.concat(chunks).toString("utf8");
}
