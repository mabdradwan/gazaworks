"use client";
import {FormEvent,useEffect,useRef,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

type Profile={id:string};
type Party={display_name?:string};
type Room={room_id:string;chat_rooms?:{id:string;project_id:string;projects?:{id:string;status:string;client_id:string;talent_id:string;client?:Party|null;talent?:Party|null}|null}|null};
type Msg={id:string;sender_id:string;body?:string|null;message_type:string;status:string;created_at:string;attachment_url?:string|null;profiles?:Party|null};

export function MessagesPanel({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[me,setMe]=useState<Profile|null>(null),[rooms,setRooms]=useState<Room[]>([]),[room,setRoom]=useState<string|null>(null),[messages,setMessages]=useState<Msg[]>([]),[notice,setNotice]=useState(""),[recording,setRecording]=useState(false);
  const recorder=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]);
  async function loadRooms(){const [r,p]=await Promise.all([fetch("/api/messages/rooms"),fetch("/api/profile")]);if(p.ok)setMe(await p.json());if(r.ok){const d=await r.json();setRooms(d);if(!room&&d[0]?.room_id)setRoom(d[0].room_id)}}
  async function loadMessages(id:string){const r=await fetch("/api/messages?roomId="+encodeURIComponent(id));if(r.ok)setMessages(await r.json())}
  useEffect(()=>{void loadRooms()},[]);
  useEffect(()=>{if(!room)return;void loadMessages(room);const db=supabaseBrowser();const channel=db.channel("room-"+room).on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages",filter:"room_id=eq."+room},()=>{void loadMessages(room)}).subscribe();return()=>{void db.removeChannel(channel)}},[room]);

  async function send(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!room)return;const f=new FormData(e.currentTarget),body=String(f.get("body")??"");const r=await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:room,body})});const d=await r.json();setNotice(d.notice??(r.ok?(ar?"تم الإرسال.":"Sent."):(ar?"تعذّر الإرسال.":"Could not send.")));if(r.ok){e.currentTarget.reset();await loadMessages(room)}}

  async function upload(file:File){if(!room)return;setNotice(ar?"جارٍ تجهيز المرفق…":"Preparing attachment…");const prep=await fetch("/api/messages/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:room,fileName:file.name,mimeType:file.type,sizeBytes:file.size})});const p=await prep.json();if(!prep.ok){setNotice(ar?"تم رفض المرفق أو نوعه غير مدعوم.":p.error??"Attachment rejected.");return}const db=supabaseBrowser();const {error}=await db.storage.from("message-files").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});if(error){setNotice(error.message);return}const done=await fetch("/api/messages/upload",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:room,path:p.path,mimeType:file.type})});setNotice(done.ok?(ar?"تم إرسال المرفق.":"Attachment sent."):(ar?"تعذّر تسجيل المرفق.":"Attachment could not be recorded."));if(done.ok)await loadMessages(room)}

  async function startRecording(){
    if(!room||!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){setNotice(ar?"التسجيل الصوتي غير مدعوم في هذا المتصفح.":"Voice recording is not supported in this browser.");return}
    try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});const rec=new MediaRecorder(stream,{mimeType:MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":undefined});chunks.current=[];rec.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data)};rec.onstop=()=>{const blob=new Blob(chunks.current,{type:"audio/webm"});stream.getTracks().forEach(t=>t.stop());void upload(new File([blob],"voice-"+Date.now()+".webm",{type:"audio/webm"}))};recorder.current=rec;rec.start();setRecording(true);setNotice(ar?"جارٍ التسجيل…":"Recording…")}catch{setNotice(ar?"تعذّر الوصول إلى الميكروفون.":"Microphone access failed.")}}
  function stopRecording(){recorder.current?.stop();setRecording(false)}

  function roomName(r:Room){const p=r.chat_rooms?.projects;if(!p)return ar?"محادثة مشروع":"Project conversation";return me?.id===p.client_id?(p.talent?.display_name??(ar?"المحترف":"Talent")):(p.client?.display_name??(ar?"العميل":"Client"))}
  return <div className="messages-layout">
    <aside className="card conversation-list"><h2>{ar?"المحادثات":"Conversations"}</h2>{rooms.length?rooms.map(r=><button className={"conversation-button "+(room===r.room_id?"active":"")} key={r.room_id} onClick={()=>setRoom(r.room_id)}><strong>{roomName(r)}</strong><small>{r.chat_rooms?.projects?.status?.replaceAll("_"," ")}</small></button>):<div className="empty">{ar?"لا توجد محادثات مشاريع بعد.":"No project conversations yet."}</div>}</aside>
    <section className="card chat-panel">
      <div className="chat-messages">{messages.length?messages.map(m=>{const mine=m.sender_id===me?.id;return <div className={"chat-message "+(mine?"mine":"other")+" "+(m.status==="pending_moderation"?"held":"")} key={m.id}><div className="message-author">{mine?(ar?"أنت":"You"):(m.profiles?.display_name??(ar?"المستخدم":"User"))}</div>{m.body&&<div className="message-body">{m.body}</div>}{m.attachment_url&&m.message_type==="image"&&<a className="chat-image" href={m.attachment_url} target="_blank" rel="noreferrer" style={{backgroundImage:"url("+m.attachment_url+")"}}/>}{m.attachment_url&&m.message_type==="voice"&&<audio controls src={m.attachment_url}/>} {m.attachment_url&&m.message_type==="document"&&<a href={m.attachment_url} target="_blank" rel="noreferrer">📎 {ar?"فتح المرفق":"Open attachment"}</a>}<small>{m.status==="pending_moderation"?(ar?"بانتظار المراجعة بسبب احتمال وجود بيانات تواصل خارجية — الحد الأقصى 24 ساعة":"Awaiting review for possible external contact information — up to 24 hours"):new Date(m.created_at).toLocaleString(ar?"ar-PS":"en")}</small></div>}):<div className="empty">{ar?"ابدأ المحادثة داخل GazaWorks.":"Start the project conversation inside GazaWorks."}</div>}</div>
      {room?<form className="chat-compose" onSubmit={send}><textarea name="body" required rows={3} placeholder={ar?"اكتب رسالة…":"Write a message…"}/><div className="form-actions"><button className="btn">{ar?"إرسال":"Send"}</button><label className="btn secondary file-action">📎 {ar?"مرفق":"Attach"}<input className="sr-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,audio/webm,audio/ogg" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f)}}/></label>{recording?<button type="button" className="btn secondary" onClick={stopRecording}>■ {ar?"إيقاف وإرسال":"Stop & send"}</button>:<button type="button" className="btn secondary" onClick={()=>void startRecording()}>🎙 {ar?"رسالة صوتية":"Voice message"}</button>}</div><p role="status">{notice}</p></form>:<div className="empty">{ar?"اختر محادثة.":"Select a conversation."}</div>}
    </section>
  </div>
}
