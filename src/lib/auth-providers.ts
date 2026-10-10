import "server-only";
import {googleProviderEnabled} from "@/domain/auth-providers";

export async function oauthProviderEnabled(provider:"google"|"apple"):Promise<boolean> {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return false;
  try {
    const response=await fetch(new URL("/auth/v1/settings",url),{headers:{apikey:key},next:{revalidate:60},signal:AbortSignal.timeout(3000)});
    if(!response.ok)return false;
    const settings:unknown=await response.json();
    return provider==="google"?googleProviderEnabled(settings):Boolean(typeof settings==="object"&&settings!==null&&"external" in settings&&typeof settings.external==="object"&&settings.external!==null&&"apple" in settings.external&&settings.external.apple===true);
  } catch {return false;}
}

export function googleSignInEnabled(){return oauthProviderEnabled("google")}
