"use client";
import {useEffect,useState} from "react";
import {apiFetch} from "@/lib/api-fetch";
import {AI_CONSENT_VERSION} from "@/lib/ai/consent-policy";
import {aiConsentCopy} from "@/lib/ai/consent-copy";
import {assistantCopy} from "@/lib/assistant-copy";
import {isLocale} from "@/lib/i18n";
const event="gazaworks-ai-preference";
export function useAIConsent(){
 const [accepted,setAccepted]=useState(false),[signedIn,setSignedIn]=useState(false),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;async function refresh(){try{const r=await apiFetch("/api/ai/consent");if(!r.ok)throw Error();const d=await r.json();if(!active)return;setSignedIn(d.signedIn);setAccepted(d.signedIn?d.accepted:sessionStorage.getItem("gw-guest-ai")===AI_CONSENT_VERSION)}catch{if(active)setFailed(true)}finally{if(active)setLoading(false)}}void refresh();window.addEventListener(event,refresh);return()=>{active=false;window.removeEventListener(event,refresh)}},[]);
 async function change(value:boolean){setLoading(true);setFailed(false);try{if(signedIn){const r=await apiFetch("/api/ai/consent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accepted:value})});if(!r.ok)throw Error()}else{if(value)sessionStorage.setItem("gw-guest-ai",AI_CONSENT_VERSION);else sessionStorage.removeItem("gw-guest-ai")}setAccepted(value);window.dispatchEvent(new Event(event));return true}catch{setFailed(true);return false}finally{setLoading(false)}}
 return {accepted,signedIn,loading,failed,change};
}
export function AIConsentNotice({locale,consent}:{locale:string;consent:ReturnType<typeof useAIConsent>}){
 const c=assistantCopy(locale);
 if(consent.accepted)return null;
 return <div className="ai-consent-once"><p>{aiConsentCopy[isLocale(locale)?locale:"en"]}</p><button type="button" className="btn secondary" disabled={consent.loading} onClick={()=>void consent.change(true)}>{c.accept}</button>{consent.failed&&<p role="alert">{c.consentFailed}</p>}</div>;
}
