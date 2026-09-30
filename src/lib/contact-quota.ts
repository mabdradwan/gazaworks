import "server-only";
import {createHmac} from "node:crypto";
import {isIP} from "node:net";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function consumeContactQuota(headers:Headers):Promise<"allowed"|"limited"|"unavailable">{
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key)return "unavailable";
  // Netlify overwrites its connection header. Arbitrary forwarded headers must
  // not let a visitor reset their quota by supplying a different address.
  const connection=process.env.NETLIFY==="true"?headers.get("x-nf-client-connection-ip")?.trim():null;
  const identity=connection&&isIP(connection)?connection:"unknown";
  const identityHash=createHmac("sha256",key).update(identity).digest("hex");
  try{
    const {error}=await supabaseAdmin().rpc("gw_contact_quota",{identity_hash:identityHash});
    return !error?"allowed":error.message==="rate_limited"?"limited":"unavailable";
  }catch{return "unavailable";}
}
