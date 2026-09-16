"use client";
import {FormEvent,useEffect,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";
import {ACCOUNT_TYPES,type AccountType} from "@/domain/marketplace";
import {authCopy} from "@/lib/auth-copy";

export function AuthForm({locale}:{locale:string}){
  const t=authCopy(locale);
  const [mode,setMode]=useState<"signin"|"register">("signin");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [oauthAccountType,setOauthAccountType]=useState<AccountType|"">("");

  useEffect(()=>{
    const params=new URLSearchParams(location.search);
    if(params.get("mode")==="register")setMode("register");
    const code=params.get("error");
    if(code==="account_type_required")setError(t.chooseType);
    else if(code==="profile_provisioning")setError(t.failed);
    else if(code==="callback")setError(t.failed);
  },[t.chooseType,t.failed]);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);setError("");
    const fd=new FormData(e.currentTarget),email=String(fd.get("email")),password=String(fd.get("password"));
    try{
      const db=supabaseBrowser();
      if(mode==="signin"){
        const {error}=await db.auth.signInWithPassword({email,password});
        if(error)throw error;
        try{await fetch("/api/security/session",{method:"POST"})}catch{}
        location.assign("/"+locale+"/dashboard");
      }else{
        const accountType=String(fd.get("accountType")) as AccountType;
        if(!ACCOUNT_TYPES.includes(accountType))throw new Error(t.chooseType);
        const {error}=await db.auth.signUp({
          email,password,
          options:{
            data:{account_type:accountType,display_name:String(fd.get("name")),locale},
            emailRedirectTo:location.origin+"/auth/callback?next=/"+locale+"/dashboard&locale="+encodeURIComponent(locale)
          }
        });
        if(error)throw error;
        setError(t.confirm);
      }
    }catch(e){
      setError(e instanceof Error?e.message:t.failed);
    }finally{setBusy(false)}
  }

  async function google(){
    setError("");
    if(mode==="register"&&!oauthAccountType){setError(t.chooseType);return}
    const callback=new URL("/auth/callback",location.origin);
    callback.searchParams.set("next","/"+locale+"/dashboard");
    callback.searchParams.set("locale",locale);
    if(mode==="register")callback.searchParams.set("accountType",oauthAccountType);
    const {error}=await supabaseBrowser().auth.signInWithOAuth({provider:"google",options:{redirectTo:callback.toString()}});
    if(error)setError(error.message);
  }

  return <div className="card">
    <div className="tabs">
      <button type="button" className={mode==="signin"?"btn":"btn secondary"} onClick={()=>{setMode("signin");setError("")}}>{t.signIn}</button>
      <button type="button" className={mode==="register"?"btn":"btn secondary"} onClick={()=>{setMode("register");setError("")}}>{t.create}</button>
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
      <label>{t.password}<input name="password" type="password" minLength={10} required autoComplete={mode==="signin"?"current-password":"new-password"}/></label>
      <button className="btn" disabled={busy}>{busy?t.wait:mode==="signin"?t.signIn:t.createSecure}</button>
    </form>
    <button className="btn secondary" type="button" style={{width:"100%",marginTop:12}} onClick={()=>void google()}>{t.google}</button>
    {error&&<p role="status" className={error===t.confirm?"success":"error"}>{error}</p>}
    <a href={"/"+locale+"/auth/reset"} className="muted">{t.forgot}</a>
  </div>
}

