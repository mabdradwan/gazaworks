import {isLocale} from "../lib/i18n";

export interface RecoveryClient {
  auth: {
    resetPasswordForEmail(email:string, options:{redirectTo:string}):Promise<{error:unknown}>;
    getUser():Promise<{data:{user:{id:string}|null};error:unknown}>;
    updateUser(attributes:{password:string}):Promise<{error:unknown}>;
    signOut(options:{scope:"global"}):Promise<{error:unknown}>;
  };
}

export function recoveryCallback(origin:string,locale:string):string {
  const language=isLocale(locale)?locale:"en";
  const callback=new URL("/auth/callback",origin);
  callback.searchParams.set("locale",language);
  callback.searchParams.set("next",`/${language}/auth/reset?mode=update`);
  return callback.toString();
}

export async function sendRecoveryLink(client:RecoveryClient,email:string,origin:string,locale:string) {
  try {
    const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:recoveryCallback(origin,locale)});
    return error?"failed" as const:"sent" as const;
  } catch {return "failed" as const;}
}

export async function replaceRecoveredPassword(client:RecoveryClient,password:string,confirmation:string) {
  if(password.length<10||password.length>128||password!==confirmation)return "invalid_password" as const;
  try {
    const {data,error}=await client.auth.getUser();
    if(error||!data.user)return "invalid_session" as const;
    const update=await client.auth.updateUser({password});
    if(update.error)return "failed" as const;
    // A failed logout must not pretend the successful password change failed.
    try {
      const logout=await client.auth.signOut({scope:"global"});
      return logout.error?"updated_session_active" as const:"updated" as const;
    } catch {return "updated_session_active" as const;}
  } catch {return "failed" as const;}
}
