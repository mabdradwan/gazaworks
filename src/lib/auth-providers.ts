import "server-only";
import {googleProviderEnabled} from "@/domain/auth-providers";

export async function googleSignInEnabled():Promise<boolean> {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return false;
  try {
    const response=await fetch(new URL("/auth/v1/settings",url),{headers:{apikey:key},next:{revalidate:60},signal:AbortSignal.timeout(3000)});
    if(!response.ok)return false;
    const settings:unknown=await response.json();
    return googleProviderEnabled(settings);
  } catch {return false;}
}
