"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useCallback,useEffect,useRef,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";
import {messagesPanelCopy} from "@/lib/messages-panel-copy";

type Profile={id:string};
type Party={display_name?:string};
type Room={room_id:string;chat_rooms?:{id:string;project_id:string;projects?:{id:string;status:string;client_id:string;talent_id:string;client?:Party|null;talent?:Party|null}|null}|null};
type Msg={id:string;sender_id:string;body?:string|null;message_type:string;status:string;created_at:string;attachment_url?:string|null;profiles?:Party|null};

export function MessagesPanel({locale="en"}:{locale?:string}){
  const c=messagesPanelCopy(locale),[me,setMe]=useState<Profile|null>(null),[rooms,setRooms]=useState<Room[]>([]),[room,setRoom]=useState<string|null>(null),[messages,setMessages]=useState<Msg[]>([]),[notice,setNotice]=useState(""),[recording,setRecording]=useState(false);
  const recorder=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]);
  const loadRooms=useCallback(async()=>{const [r,p]=await Promise.all([apiFetch("/api/messages/rooms"),apiFetch("/api/profile")]);if(p.ok)setMe(await p.json());if(r.ok){const d=await r.json();setRooms(d);setRoom(current=>current??d[0]?.room_id??null)}},[]);
  const loadMessages=useCallback(async(id:string)=>{const r=await apiFetch("/api/messages?roomId="+encodeURIComponent(id));if(r.ok)setMessages(await r.json())},[]);
  useEffect(()=>{void loadRooms()},[loadRooms]);
  useEffect(()=>{if(!room)return;void loadMessages(room);const db=supabaseBrowser();const channel=db.channel("room-"+room).on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages",filter:"room_id=eq."+room},()=>{void loadMessages(room)}).subscribe();return()=>{void db.removeChannel(channel)}},[room,loadMessages]);

  async function send(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!room)return;const formEl=e.currentTarget,f=new FormData(formEl),body=String(f.get("body")??"");const r=await apiFetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:room,body})});const d=await r.json().catch(()=>({}));setNotice(r.ok?(d.status==="pending_moderation"?c.pendingReview:c.sent):c.failed);if(r.ok){formEl.reset();await loadMessages(room)}}

  async function upload(file:File){if(!room)return;setNotice(c.preparing);const prep=await apiFetch("/api/messages/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:room,fileName:file.name,mimeType:file.type,sizeBytes:file.size})});const p=await prep.json().catch(()=>({}));if(!prep.ok){setNotice(c.attachmentRejected);return}const db=supabaseBrowser();const {error}=await db.storage.from("message-files").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});if(error){setNotice(c.attachmentRejected);return}const done=await apiFetch("/api/messages/upload",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:room,path:p.path,mimeType:file.type})});const result=await done.json().catch(()=>({}));setNotice(done.ok?(result.status==="pending_moderation"?c.pendingReview:c.attachmentSent):c.attachmentRecordFailed);if(done.ok)await loadMessages(room)}

  async function startRecording(){
    if(!room||!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){setNotice(c.recordingUnsupported);return}
    const mimeType=MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":MediaRecorder.isTypeSupported("audio/ogg")?"audio/ogg":null;
    if(!mimeType){setNotice(c.recordingUnsupported);return}
    try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});const rec=new MediaRecorder(stream,{mimeType});chunks.current=[];rec.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data)};rec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(!chunks.current.length){setNotice(c.attachmentRejected);return}const blob=new Blob(chunks.current,{type:mimeType});void upload(new File([blob],"voice-"+Date.now()+(mimeType==="audio/ogg"?".ogg":".webm"),{type:mimeType}))};recorder.current=rec;rec.start();setRecording(true);setNotice(c.recording)}catch{setNotice(c.microphoneFailed)}}
  function stopRecording(){recorder.current?.stop();setRecording(false)}

  function roomName(r:Room){const p=r.chat_rooms?.projects;if(!p)return c.projectConversation;return me?.id===p.client_id?(p.talent?.display_name??c.talent):(p.client?.display_name??c.client)}
  return <div className="messages-layout">
    <aside className="card conversation-list"><h2>{c.conversations}</h2>{rooms.length?rooms.map(r=><button className={"conversation-button "+(room===r.room_id?"active":"")} key={r.room_id} onClick={()=>setRoom(r.room_id)}><strong>{roomName(r)}</strong><small>{r.chat_rooms?.projects?.status?(c.projectStates[r.chat_rooms.projects.status]??r.chat_rooms.projects.status.replaceAll("_"," ")):""}</small></button>):<div className="empty">{c.noConversations}</div>}</aside>
    <section className="card chat-panel">
      <div className="chat-messages">{messages.length?messages.map(m=>{const mine=m.sender_id===me?.id;return <div className={"chat-message "+(mine?"mine":"other")+" "+(m.status==="pending_moderation"?"held":"")} key={m.id}><div className="message-author">{mine?c.you:(m.profiles?.display_name??c.user)}</div>{m.body&&<div className="message-body">{m.body}</div>}{m.attachment_url&&m.message_type==="image"&&<a className="chat-image" href={m.attachment_url} target="_blank" rel="noreferrer" aria-label={c.openAttachment} style={{backgroundImage:"url("+m.attachment_url+")"}}/>}{m.attachment_url&&m.message_type==="voice"&&<audio controls src={m.attachment_url}/>} {m.attachment_url&&m.message_type==="document"&&<a href={m.attachment_url} target="_blank" rel="noreferrer">📎 {c.openAttachment}</a>}<small>{m.status==="pending_moderation"?c.pendingReview:new Date(m.created_at).toLocaleString(c.localeTag)}</small></div>}):<div className="empty">{c.startConversation}</div>}</div>
      {room?<form className="chat-compose" onSubmit={send}><textarea name="body" required rows={3} placeholder={c.messagePlaceholder}/><div className="form-actions"><button className="btn">{c.send}</button><label className="btn secondary file-action">📎 {c.attach}<input className="sr-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,audio/webm,audio/ogg" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f)}}/></label>{recording?<button type="button" className="btn secondary" onClick={stopRecording}>■ {c.stopSend}</button>:<button type="button" className="btn secondary" onClick={()=>void startRecording()}>🎙 {c.voiceMessage}</button>}</div><p role="status">{notice}</p></form>:<div className="empty">{c.selectConversation}</div>}
    </section>
  </div>
}
