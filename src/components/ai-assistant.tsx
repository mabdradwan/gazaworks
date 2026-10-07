"use client";
import {useRouter} from "next/navigation";
import {FormEvent,useCallback,useEffect,useRef,useState} from "react";
import {MessageCircle,Mic,MicOff,Phone,PhoneOff,Send,Settings,X} from "lucide-react";
import {apiFetch} from "@/lib/api-fetch";
import {assistantCopy} from "@/lib/assistant-copy";
import {useAIConsent,AIConsentNotice} from "@/components/ai-consent";
import {westernDigits} from "@/domain/professional-data";
import {draftCopy} from "@/lib/draft-copy";
import {LiveVoiceSession,type LiveState} from '@/lib/live-voice';
import {VoiceCapture} from "@/lib/voice-capture";
type Reply={text:string;action?:string;changes?:Record<string,unknown>;actionToken?:string;autoApply?:boolean;undoToken?:string;status?:"saved"|"undone"|"error";jobs?:{id:string;title:string;href:string}[]};
type Message={id:string;role:"user"|"assistant";reply:Reply};
export function AIAssistant({locale="en",mode="faq",onClose}:{locale?:string;mode?:"faq"|"talent_search";onClose?:()=>void}){
 const router=useRouter();
 const c=assistantCopy(locale),consent=useAIConsent(),labels=draftCopy(locale).fields;
 const [prompt,setPrompt]=useState(""),[messages,setMessages]=useState<Message[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[settings,setSettings]=useState(false),[supported,setSupported]=useState(false),[voiceMode,setVoiceMode]=useState<"call"|"record"|null>(null),[listening,setListening]=useState(false),[connecting,setConnecting]=useState(false),[speaking,setSpeaking]=useState(false);
 const live=useRef<LiveVoiceSession|null>(null),[liveState,setLiveState]=useState<LiveState>("connecting"),[muted,setMuted]=useState(false),[level,setLevel]=useState(0),[elapsed,setElapsed]=useState(0);
 const callStarted=useRef(0);
 const capture=useRef<VoiceCapture|null>(null),audioContext=useRef<AudioContext|null>(null),transcription=useRef<AbortController|null>(null),restart=useRef<ReturnType<typeof setTimeout>|null>(null),generation=useRef(0);
 const voice=useRef<"call"|"record"|null>(null),busyRef=useRef(false),history=useRef<Message[]>([]),mounted=useRef(true),input=useRef<HTMLTextAreaElement>(null),feed=useRef<HTMLDivElement>(null),sendRef=useRef<(text:string)=>Promise<void>>(async()=>{}),listenRef=useRef<()=>void>(()=>{});
 useEffect(()=>{mounted.current=true;setSupported(typeof navigator.mediaDevices?.getUserMedia==="function"&&typeof window.AudioContext!=="undefined");return()=>{mounted.current=false;generation.current++;voice.current=null;if(restart.current)clearTimeout(restart.current);live.current?.close();capture.current?.close();transcription.current?.abort();if(!capture.current&&audioContext.current?.state!=="closed")void audioContext.current?.close();window.speechSynthesis?.cancel()}},[]);
 useEffect(()=>{history.current=messages;feed.current?.scrollTo({top:feed.current.scrollHeight,behavior:"smooth"})},[messages,busy]);
 useEffect(()=>{if(onClose)input.current?.focus()},[onClose]);
 function stopVoice(){generation.current++;live.current?.close();live.current=null;setMuted(false);setLevel(0);if(restart.current)clearTimeout(restart.current);capture.current?.close();if(!capture.current&&audioContext.current?.state!=="closed")void audioContext.current?.close();capture.current=null;audioContext.current=null;transcription.current?.abort();setConnecting(false);setSpeaking(false);voice.current=null;setVoiceMode(null);window.speechSynthesis?.cancel();setListening(false)}
 async function apply(id:string,token:string,undo=false){
  const r=await apiFetch("/api/assistant/action",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})}),d=await r.json();
  if(!mounted.current)return false;
  if(!r.ok){setError(d.error==="profile_conflict"?c.conflict:c.failed);return false}
  setMessages(v=>v.map(m=>m.id===id?{...m,reply:{...m.reply,status:undo?"undone":"saved",actionToken:undefined,autoApply:false,undoToken:undo?undefined:d.undoToken}}:m));
  window.dispatchEvent(new CustomEvent("gazaworks-profile-changed",{detail:{changes:d.changes}}));router.refresh();return true;
 }
 async function manualApply(id:string,token:string,undo=false){if(busyRef.current)return;busyRef.current=true;setBusy(true);setError("");try{await apply(id,token,undo)}finally{busyRef.current=false;setBusy(false)}}
 async function send(text:string){
  if(!text.trim()||busyRef.current||!consent.accepted)return;
  if(live.current&&voice.current==="call"){if(live.current.sendText(text)){setPrompt("");setError("")}return;}
  const voiceAttempt=generation.current;capture.current?.cancelListening();setListening(false);busyRef.current=true;setBusy(true);setError("");setPrompt("");
  const user:Message={id:crypto.randomUUID(),role:"user",reply:{text}},past=history.current.slice(-8).map(m=>({role:m.role,text:m.reply.text.slice(0,4000)}));
  setMessages(v=>[...v,user]);let spoken="";
  try{
   const r=await apiFetch(mode==="talent_search"?"/api/ai/talent-search":"/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:text,locale,consentToExternalAI:true,...(mode!=="talent_search"?{history:past}:{})})}),reply=await r.json();
   if(!r.ok)throw Error();if(!mounted.current)return;
   const id=crypto.randomUUID();setMessages(v=>[...v,{id,role:"assistant",reply}]);spoken=reply.text;
   if(reply.autoApply&&reply.actionToken){const saved=await apply(id,reply.actionToken);spoken=saved?c.applied:c.failed}
  }catch{if(mounted.current){setError(c.failed);setPrompt(text)}spoken=c.failed;stopVoice()}
  finally{busyRef.current=false;if(mounted.current)setBusy(false)}
  if(voice.current==="call"&&mounted.current&&generation.current===voiceAttempt){
   if(spoken)listenRef.current();
  }
 }
 sendRef.current=send;
 function listen(){
  if(!capture.current||!voice.current||busyRef.current)return;
  const attempt=generation.current;
  void capture.current.listen(audio=>{if(!mounted.current||generation.current!==attempt||!voice.current)return;setListening(false);if(!audio){if(voice.current==='call')listenRef.current();else stopVoice();return}void transcribe(audio,attempt)}).then(()=>{if(mounted.current&&generation.current===attempt)setListening(true)}).catch(()=>{if(mounted.current&&generation.current===attempt){setError(c.microphone);stopVoice()}});
 }
 async function transcribe(audio:Blob,attempt:number){
  const recording=voice.current==='record';setConnecting(true);const controller=new AbortController();transcription.current=controller;
  try{const r=await apiFetch('/api/assistant/transcribe?locale='+encodeURIComponent(locale),{method:'POST',headers:{'Content-Type':'audio/wav','x-ai-consent':'true'},body:audio,signal:controller.signal});const d=await r.json();if(!mounted.current||generation.current!==attempt)return;if(!r.ok)throw Error();setConnecting(false);const text=westernDigits(String(d.text??'')).trim();if(recording){setPrompt(v=>(v+' '+text).trim().slice(0,4000));stopVoice()}else if(text.length>=2){await sendRef.current(text)}else listenRef.current();}
  catch{if(mounted.current&&generation.current===attempt){setError(c.transcriptionFailed);stopVoice()}}
 }

 listenRef.current=listen;

 async function startVoice(mode:"call"|"record"){
  if(voice.current||connecting){if(voice.current==="record"&&listening)capture.current?.finish();else stopVoice();return}
  setError("");setConnecting(true);const attempt=++generation.current;
  // Keep the granted device for the conversation; browser speech services are not used.
  try{
   if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new DOMException("Secure microphone access required","NotAllowedError");
   window.speechSynthesis?.cancel();

   const context=new AudioContext({sampleRate:mode==="call"?16000:48000,latencyHint:"interactive"});audioContext.current=context;void context.resume();
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
   if(!mounted.current||generation.current!==attempt){stream.getTracks().forEach(track=>track.stop());if(context.state!=="closed")void context.close();return}
   voice.current=mode;setVoiceMode(mode);
   if(mode==="call"){
    setElapsed(0);setLiveState('connecting');setMuted(false);
    const call=new LiveVoiceSession(stream,context,{
     state:state=>{if(!mounted.current||generation.current!==attempt)return;setLiveState(state);setConnecting(state==='connecting');setListening(state==='listening');setSpeaking(state==='speaking');if(!callStarted.current&&state!=='connecting')callStarted.current=Date.now();},
     level:value=>{if(mounted.current&&generation.current===attempt)setLevel(value)},
     transcript:(role,id,text)=>{if(!mounted.current||generation.current!==attempt)return;setMessages(v=>{const found=v.some(m=>m.id===id);return found?v.map(m=>m.id===id?{...m,reply:{...m.reply,text}}:m):[...v,{id,role,reply:{text}}]})},
     tool:async(request,signal)=>{
      if(!mounted.current||generation.current!==attempt||signal.aborted)return {error:'cancelled'};
      busyRef.current=true;setBusy(true);
      try{
       const response=await apiFetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:request,locale,consentToExternalAI:true,history:history.current.slice(-8).map(m=>({role:m.role,text:m.reply.text.slice(0,4000)}))}),signal});
       const reply:Reply=await response.json();if(!response.ok)return {error:'action_failed',text:c.failed};
       if(!mounted.current||generation.current!==attempt||signal.aborted)return {error:'cancelled'};
       const id=crypto.randomUUID();setMessages(v=>[...v,{id,role:'assistant',reply}]);
       if(reply.autoApply&&reply.actionToken){if(signal.aborted)return {error:'cancelled'};const saved=await apply(id,reply.actionToken);return {text:saved?c.applied:c.failed,saved,changes:saved?reply.changes:undefined};}
       return {text:reply.text,reviewRequired:Boolean(reply.actionToken),jobs:reply.jobs};
      }finally{busyRef.current=false;if(mounted.current&&generation.current===attempt)setBusy(false)}
     },
     error:code=>{if(!mounted.current||generation.current!==attempt)return;setError(code==='live_quota_exceeded'?c.liveQuota:code==='live_disconnected'||code==='live_connection_failed'?c.liveDisconnected:c.liveUnavailable);stopVoice()},
     ended:()=>{if(mounted.current&&generation.current===attempt){stopVoice();setError(c.liveEnded)}}
    });live.current=call;callStarted.current=0;await call.start(locale);
   }else{capture.current=new VoiceCapture(stream,context);setConnecting(false);listen();}
  }catch(err){if(mounted.current&&generation.current===attempt){setError(err instanceof DOMException&&err.name==="NotAllowedError"?c.blockedMic:err instanceof DOMException&&["NotFoundError","NotReadableError"].includes(err.name)?c.missingMic:mode==='call'?(err instanceof Error&&err.message==='live_quota_exceeded'?c.liveQuota:c.liveUnavailable):c.microphone);stopVoice()}}
 }

 useEffect(()=>{if(voiceMode!=='call')return;const timer=setInterval(()=>{if(callStarted.current)setElapsed(Math.floor((Date.now()-callStarted.current)/1000))},1000);return()=>clearInterval(timer)},[voiceMode]);
 async function submit(event:FormEvent){event.preventDefault();await send(prompt)}
 return <section className="ai-assistant-card ai-conversation" aria-label={c.title}>
  <header className="ai-panel-header"><strong>{c.title}</strong><div><button type="button" className="ai-icon-button" aria-label={c.settings} aria-expanded={settings} onClick={()=>setSettings(v=>!v)}><Settings size={20}/></button>{onClose&&<button type="button" className="ai-icon-button" aria-label={c.close} onClick={()=>{stopVoice();onClose()}}><X size={22}/></button>}</div></header>
  <p className="ai-scope muted">{consent.signedIn?c.member:c.guest}</p>
  {settings&&<div className="ai-settings"><p className="muted">{c.voiceHint}</p>{consent.accepted&&<button type="button" className="btn secondary" disabled={consent.loading||busy} onClick={()=>{stopVoice();void consent.change(false)}}>{c.disable}</button>}</div>}
  <AIConsentNotice locale={locale} consent={consent}/>
  <div className="ai-message-feed" ref={feed} role="log" aria-live="polite" aria-relevant="additions text">
   {!messages.length&&<p className="muted">{c.empty}</p>}
   {messages.map(m=><div key={m.id} className={`ai-message ai-message-${m.role}`}>
    <p dir="auto">{m.reply.text}</p>
    {m.reply.changes&&<details open><summary>{c.changed}</summary><dl>{Object.entries(m.reply.changes).map(([key,value])=><div key={key}><dt>{labels[key]??key}</dt><dd dir="auto">{Array.isArray(value)?value.join("، "):String(value??"")}</dd></div>)}</dl></details>}
    {m.reply.status&&<p className="ai-action-status">{m.reply.status==="saved"?c.applied:m.reply.status==="undone"?c.undone:c.failed}</p>}
    {m.reply.actionToken&&<><p>{c.review}</p><button className="btn" type="button" disabled={busy} onClick={()=>void manualApply(m.id,m.reply.actionToken!)}>{c.apply}</button></>}
    {m.reply.undoToken&&<button className="btn secondary" type="button" disabled={busy} onClick={()=>void manualApply(m.id,m.reply.undoToken!,true)}>{c.undo}</button>}
    {!!m.reply.jobs?.length&&<ul>{m.reply.jobs.map(job=><li key={job.id}><a href={job.href}>{job.title}</a></li>)}</ul>}
   </div>)}
   {busy&&<p role="status">{c.busy}</p>}
  </div>
  {error&&<p className="error ai-chat-error" role="alert">{error}</p>}
  {!supported&&<small className="muted ai-chat-error">{c.unsupported}</small>}
  {consent.accepted&&<form className="ai-composer" onSubmit={submit}>
   {voiceMode!=='call'&&<><small className="muted">{c.textMessage}</small><textarea ref={input} aria-label={c.textMessage} placeholder={c.prompt} value={prompt} onChange={e=>setPrompt(westernDigits(e.target.value))} rows={2} maxLength={4000} required minLength={2} disabled={busy||connecting||!consent.accepted} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send(prompt)}}}/>
   <div className="ai-composer-actions"><button className="btn" type="submit" disabled={busy||connecting||!consent.accepted||prompt.trim().length<2}><Send size={17}/>{c.send}</button><button className="btn secondary" type="button" disabled={(!voiceMode&&busy)||!consent.accepted||!supported} aria-pressed={false} onClick={()=>void startVoice("call")}><Phone size={17}/> {connecting?c.stop:c.call}</button></div></>}
   {voiceMode==='call'&&<div className="ai-live-call" data-state={liveState}>
    <div className="ai-live-orb" aria-hidden="true"><span style={{transform:`scale(${1+level*.45})`}}/><Mic size={28}/></div>
    <strong>{c.liveTitle}</strong><small dir="ltr">{String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}</small>
    <p role="status">{connecting?c.connecting:muted?c.muted:speaking?c.speaking:liveState==='thinking'?c.busy:c.listening}</p><small className="muted">{c.liveHint}</small>
    <div className="ai-live-controls"><button type="button" className="btn secondary" aria-pressed={muted} onClick={()=>{const value=!muted;setMuted(value);live.current?.setMuted(value)}}>{muted?<MicOff size={18}/>:<Mic size={18}/>} {muted?c.unmute:c.mute}</button><button type="button" className="btn ai-end-call" onClick={stopVoice}><PhoneOff size={18}/>{c.endCall}</button></div>
   </div>}
   {voiceMode!=="call"&&connecting&&<div className="ai-call-status" role="status">{connecting?(voiceMode?c.transcribing:c.connecting):speaking?c.speaking:busy?c.busy:c.connected}</div>}
   {voiceMode!=="call"&&listening&&<span className="ai-listening" role="status">{c.listening}</span>}
  </form>}
 </section>;
}
export function FloatingAssistant({locale}:{locale:string}){
 const c=assistantCopy(locale),[open,setOpen]=useState(false),trigger=useRef<HTMLButtonElement>(null);
 const close=useCallback(()=>{setOpen(false);trigger.current?.focus()},[]);
 useEffect(()=>{function escape(e:KeyboardEvent){if(e.key==="Escape"&&open)close()}window.addEventListener("keydown",escape);return()=>window.removeEventListener("keydown",escape)},[open,close]);
 return <div className="floating-assistant">{open&&<div className="floating-ai-panel" role="dialog" aria-modal="false" aria-label={c.title}><AIAssistant locale={locale} onClose={close}/></div>}<button ref={trigger} type="button" className="floating-ai-trigger" aria-label={open?c.close:c.open} aria-expanded={open} onClick={()=>open?close():setOpen(true)}>{open?<X size={24}/>:<MessageCircle size={25}/>}<span>{c.title}</span></button></div>;
}
