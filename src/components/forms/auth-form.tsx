"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useEffect,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";
import {ACCOUNT_TYPES,type AccountType} from "@/domain/marketplace";
import {authCopy} from "@/lib/auth-copy";
import {useRouter} from "next/navigation";
import {safeReturnPath} from "@/domain/navigation";

export function AuthForm({locale,initialMode="signin",errorCode,next}:{locale:string;initialMode?:"signin"|"register";errorCode?:string;next?:string}){
  const t=authCopy(locale);
  const router=useRouter();
  const mode=initialMode;
  const destination=safeReturnPath(next,locale);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [oauthAccountType,setOauthAccountType]=useState<AccountType|"">("");

  useEffect(()=>{
    if(errorCode==="account_type_required")setError(t.chooseType);
    else if(errorCode==="account_unavailable")setError(t.accountUnavailable);
    else if(errorCode==="profile_provisioning"||errorCode==="callback")setError(t.failed);
  },[errorCode,t.chooseType,t.failed,t.accountUnavailable]);

  function changeMode(value:"signin"|"register"){
    setError("");setOauthAccountType("");
    const query=new URLSearchParams({next:destination});
    if(value==="register")query.set("mode","register");
    router.replace(`/${locale}/auth?${query}`);
  }

  function callbackURL(){
    const callback=new URL("/auth/callback",location.origin);
    callback.searchParams.set("next",destination);
    callback.searchParams.set("locale",locale);
    return callback;
  }

  async function enterWorkspace(){
    const response=await apiFetch("/api/security/session",{method:"POST"});
    if(!response.ok){
      const result:unknown=await response.json();
      const code=result&&typeof result==="object"&&"error" in result?result.error:null;
      if(code==="account_type_required"){
        const query=new URLSearchParams({mode:"register",error:"account_type_required",next:destination});
        router.replace(`/${locale}/auth?${query}`);
      }
      throw new Error(code==="account_unavailable"?t.accountUnavailable:code==="account_type_required"?t.chooseType:t.failed);
    }
    location.assign(destination);
  }

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);setError("");
    const fd=new FormData(e.currentTarget),email=String(fd.get("email")),password=String(fd.get("password"));
    try{
      const db=supabaseBrowser();
      if(mode==="signin"){
        const {error}=await db.auth.signInWithPassword({email,password});
        if(error)throw error;
        await enterWorkspace();
      }else{
        const accountType=String(fd.get("accountType")) as AccountType;
        if(!ACCOUNT_TYPES.includes(accountType))throw new Error(t.chooseType);
        const {data,error}=await db.auth.signUp({
          email,password,
          options:{
            data:{account_type:accountType,display_name:String(fd.get("name")),locale},
            emailRedirectTo:callbackURL().toString()
          }
        });
        if(error)throw error;
        if(data.session){await enterWorkspace();return}
        setError(t.confirm);
      }
    }catch(e){
      setError(e instanceof Error?e.message:t.failed);
    }finally{setBusy(false)}
  }

  async function google(){
    setError("");
    if(mode==="register"&&!oauthAccountType){setError(t.chooseType);return}
    setBusy(true);
    try{
      const callback=callbackURL();
      if(mode==="register")callback.searchParams.set("accountType",oauthAccountType);
      const {error}=await supabaseBrowser().auth.signInWithOAuth({provider:"google",options:{redirectTo:callback.toString()}});
      if(error)throw error;
    }catch(e){setError(e instanceof Error?e.message:t.failed)}finally{setBusy(false)}
  }

  return <div className="card">
    <div className="tabs">
      <button type="button" disabled={busy} className={mode==="signin"?"btn":"btn secondary"} onClick={()=>changeMode("signin")}>{t.signIn}</button>
      <button type="button" disabled={busy} className={mode==="register"?"btn":"btn secondary"} onClick={()=>changeMode("register")}>{t.create}</button>
    </div>
    <h1>{mode==="signin"?t.welcome:t.join}</h1>
    <form className="grid" onSubmit={submit}>
      {mode==="register"&&<>
        <label>{t.name}<input name="name" minLength={2} maxLength={100} required/></label>
        <label>{t.accountType}<select name="accountType" required defaultValue="" onChange={e=>setOauthAccountType(e.target.value as AccountType)}>
          <option value="" disabled>{t.choose}</option>
          <option value="individual">{t.individual}</option>
          <option value="team">{t.team}</option>
          <option value="client">{t.client}</option>
        </select></label>
      </>}
      <label>{t.email}<input name="email" type="email" required autoComplete="email"/></label>
      <label>{t.password}<input name="password" type="password" minLength={mode==="register"?10:undefined} required autoComplete={mode==="signin"?"current-password":"new-password"}/></label>
      <button className="btn" disabled={busy}>{busy?t.wait:mode==="signin"?t.signIn:t.createSecure}</button>
    </form>
    <button className="btn secondary" disabled={busy} type="button" style={{width:"100%",marginTop:12}} onClick={()=>void google()}>{t.google}</button>
    {error&&<p role="status" className={error===t.confirm?"success":"error"}>{error}</p>}
    <a href={"/"+locale+"/auth/reset"} className="muted">{t.forgot}</a>
  </div>
}
