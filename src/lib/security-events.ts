import "server-only";
import {createHash} from "crypto";
import {supabaseAdmin} from "@/lib/supabase/admin";

function digest(value:string){
  const salt=process.env.SECURITY_HASH_SALT??process.env.CRON_SECRET??"gazaworks-security";
  return createHash("sha256").update(salt+"|"+value).digest("hex");
}

export async function recordLoginEvent(input:{profileId:string;provider:string;ip?:string|null;userAgent?:string|null;metadata?:Record<string,unknown>}){
  const db=supabaseAdmin();
  const ipHash=input.ip?digest(input.ip):null;
  const ua=input.userAgent??null;
  const deviceHash=ua?digest(ua):null;

  const {data:previous}=await db.from("login_history")
    .select("device_hash,created_at")
    .eq("profile_id",input.profileId)
    .order("created_at",{ascending:false})
    .limit(1)
    .maybeSingle();

  const isNewDevice=Boolean(deviceHash&&previous?.device_hash&&previous.device_hash!==deviceHash);

  await db.from("login_history").insert({
    profile_id:input.profileId,
    provider:input.provider,
    success:true,
    ip_hash:ipHash,
    user_agent:ua,
    device_hash:deviceHash,
    metadata:{...(input.metadata??{}),newDevice:isNewDevice}
  });

  await db.from("security_logs").insert({
    profile_id:input.profileId,
    event:isNewDevice?"login_new_device":"login_success",
    risk:isNewDevice?"medium":"low",
    ip_hash:ipHash,
    user_agent:ua,
    metadata:{provider:input.provider,newDevice:isNewDevice}
  });

  if(isNewDevice){
    await db.from("notifications").insert({
      profile_id:input.profileId,
      category:"security",
      title:"New sign-in detected",
      body:"A sign-in from a new browser or device was recorded on your GazaWorks account.",
      data:{provider:input.provider}
    });
  }
}

export function requestNetworkMetadata(headers:Headers){
  const forwarded=headers.get("x-forwarded-for");
  const ip=forwarded?.split(",")[0]?.trim()??headers.get("x-real-ip");
  return {ip,userAgent:headers.get("user-agent")};
}
