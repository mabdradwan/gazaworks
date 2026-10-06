import {apiFetch} from '@/lib/api-fetch';
import type {LiveConnectConfig,LiveServerMessage,Session} from '@google/genai';
export type LiveState='connecting'|'listening'|'thinking'|'speaking';
type Callbacks={state:(state:LiveState)=>void;level:(level:number)=>void;transcript:(role:'user'|'assistant',id:string,text:string)=>void;tool:(request:string,signal:AbortSignal)=>Promise<unknown>;error:(code:string)=>void;ended:()=>void};
export function pcm16(samples:Float32Array){const data=new Uint8Array(samples.length*2),view=new DataView(data.buffer);for(let i=0;i<samples.length;i++){const x=Math.max(-1,Math.min(1,samples[i]));view.setInt16(i*2,x<0?x*32768:x*32767,true)}return data;}
function base64(bytes:Uint8Array){let text='';for(const byte of bytes)text+=String.fromCharCode(byte);return btoa(text);}
export function mergeTranscript(previous:string,fragment:string){return (fragment.startsWith(previous)?fragment:previous+fragment).slice(0,12000);}
export class LiveVoiceSession{
 private session:Session|null=null;private stopped=false;private source:MediaStreamAudioSourceNode|null=null;private processor:AudioWorkletNode|ScriptProcessorNode|null=null;private queue=new Set<AudioBufferSourceNode>();private nextAudio=0;private inputId=crypto.randomUUID();private outputId=crypto.randomUUID();private inputText='';private outputText='';private lastRequest='';private newTurn=true;private mute=false;private ready=false;private greeted=false;private lastLevel=0;private timer:ReturnType<typeof setTimeout>|null=null;private timeout:ReturnType<typeof setTimeout>|null=null;private abort=new AbortController();private toolControllers=new Map<string,AbortController>();private seenTools=new Set<string>();private servedTurns=new Set<string>();
 constructor(private stream:MediaStream,private context:AudioContext,private callbacks:Callbacks){}
 async start(locale:string){
  const [response,sdk]=await Promise.all([apiFetch('/api/assistant/live/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({locale,consentToExternalAI:true}),signal:this.abort.signal}),import('@google/genai')]);
  const data=await response.json();if(this.stopped)return;if(!response.ok)throw Error(data.error??'live_unavailable');
  const client=new sdk.GoogleGenAI({apiKey:data.token,httpOptions:{apiVersion:data.apiVersion}});
  this.timeout=setTimeout(()=>this.fail('live_connection_failed'),20000);
  const session=await client.live.connect({model:data.model,config:data.config as LiveConnectConfig,callbacks:{onmessage:message=>{if(!this.stopped)void this.receive(message).catch(()=>this.fail('live_connection_failed'))},onerror:()=>this.fail('live_connection_failed'),onclose:()=>{if(!this.stopped)this.fail('live_disconnected')}}});
  if(this.stopped){session.close();return}this.session=session;this.greet();
  await this.startCapture();if(this.stopped)return;
  this.timer=setTimeout(()=>{this.close();this.callbacks.ended()},Math.min(data.durationSeconds*1000,300000));
 }
 private greet(){if(!this.ready||!this.session||this.greeted||this.stopped)return;this.greeted=true;this.session.sendClientContent({turns:[{role:'user',parts:[{text:'Greet me briefly in the selected language and ask how you can help, then listen.'}]}],turnComplete:true});}
 private async startCapture(){
  if(this.stopped)return;this.source=this.context.createMediaStreamSource(this.stream);
  if(this.context.audioWorklet){await this.context.audioWorklet.addModule('/voice-input-worklet.js');if(this.stopped)return;const node=new AudioWorkletNode(this.context,'gazaworks-voice-input');node.port.onmessage=e=>this.audio(e.data as Float32Array);this.processor=node;}
  else{const node=this.context.createScriptProcessor(512,1,1);node.onaudioprocess=e=>this.audio(e.inputBuffer.getChannelData(0));this.processor=node;}
  this.source.connect(this.processor);this.processor.connect(this.context.destination);
 }
 private audio(samples:Float32Array){
  if(this.stopped||!this.ready||this.mute||!this.session)return;
  const rms=Math.sqrt(samples.reduce((n,x)=>n+x*x,0)/samples.length),now=Date.now();if(now-this.lastLevel>100){this.callbacks.level(Math.min(1,rms*12));this.lastLevel=now;}
  try{this.session.sendRealtimeInput({audio:{data:base64(pcm16(samples)),mimeType:`audio/pcm;rate=${this.context.sampleRate}`}})}catch{this.fail('live_connection_failed');}
 }
 private async receive(message:LiveServerMessage){
  if(message.setupComplete){this.ready=true;if(this.timeout)clearTimeout(this.timeout);this.callbacks.state('listening');this.greet();}
  const content=message.serverContent;
  if(content){
   if(content.interrupted){this.newTurn=true;this.clearAudio();this.outputText='';this.outputId=crypto.randomUUID();this.callbacks.state('listening');}
   if(content.inputTranscription?.text){if(this.newTurn){this.inputId=crypto.randomUUID();this.inputText='';this.outputId=crypto.randomUUID();this.outputText='';this.newTurn=false;}this.inputText=mergeTranscript(this.inputText,content.inputTranscription.text);this.lastRequest=this.inputText;this.callbacks.transcript('user',this.inputId,this.inputText);this.callbacks.state('thinking');}
   if(content.outputTranscription?.text){this.outputText=mergeTranscript(this.outputText,content.outputTranscription.text);this.callbacks.transcript('assistant',this.outputId,this.outputText);}
   for(const part of content.modelTurn?.parts??[])if(part.inlineData?.data&&part.inlineData.mimeType?.startsWith('audio/pcm'))this.play(part.inlineData.data,Number(/rate=(\d+)/.exec(part.inlineData.mimeType)?.[1]??24000));
   if(content.turnComplete){this.newTurn=true;this.outputId=crypto.randomUUID();this.outputText='';if(!this.queue.size)this.callbacks.state('listening');}
  }
  for(const id of message.toolCallCancellation?.ids??[]){this.toolControllers.get(id)?.abort();this.toolControllers.delete(id);}
  for(const call of message.toolCall?.functionCalls??[]){
   if(!call.id||!call.name||this.seenTools.has(call.id))continue;this.seenTools.add(call.id);const controller=new AbortController();this.toolControllers.set(call.id,controller);this.callbacks.state('thinking');
   let result:unknown={error:'unsupported_action'};
   try{if(call.name==='account_request'){// Only the actual input transcript authorizes an account request; never model arguments.
    if(this.servedTurns.has(this.inputId))result={error:'already_handled',text:'The latest user request was already handled. Do not execute it again.'};else if(!this.lastRequest.trim())result={error:'repeat_request',text:'Please repeat your actual account request.'};else{this.servedTurns.add(this.inputId);result=await this.callbacks.tool(this.lastRequest.slice(0,4000),controller.signal);}
   }}catch{result={error:'action_failed',text:'The action result could not be confirmed. Do not claim it succeeded.'};}
   this.toolControllers.delete(call.id);if(!this.stopped&&!controller.signal.aborted)this.session?.sendToolResponse({functionResponses:[{id:call.id,name:call.name,response:{result}}]});
  }
 }
 private play(encoded:string,rate:number){
  if(this.stopped||!Number.isFinite(rate)||rate<8000||rate>48000||encoded.length>2000000)return;
  if(this.nextAudio-this.context.currentTime>30){this.fail('live_audio_failed');return;}const bytes=atob(encoded);if(bytes.length%2)return;const data=new DataView(Uint8Array.from(bytes,x=>x.charCodeAt(0)).buffer),buffer=this.context.createBuffer(1,bytes.length/2,rate),channel=buffer.getChannelData(0);for(let i=0;i<channel.length;i++)channel[i]=data.getInt16(i*2,true)/32768;
  const node=this.context.createBufferSource();node.buffer=buffer;node.connect(this.context.destination);this.queue.add(node);this.nextAudio=Math.max(this.nextAudio,this.context.currentTime+.02);node.start(this.nextAudio);this.nextAudio+=buffer.duration;this.callbacks.state('speaking');node.onended=()=>{this.queue.delete(node);node.disconnect();if(!this.stopped&&!this.queue.size)this.callbacks.state('listening');};
 }
 private clearAudio(){for(const node of this.queue){node.onended=null;try{node.stop()}catch{}node.disconnect();}this.queue.clear();this.nextAudio=0;}
 setMuted(muted:boolean){this.mute=muted;this.stream.getAudioTracks().forEach(t=>t.enabled=!muted);if(muted&&this.ready)this.session?.sendRealtimeInput({audioStreamEnd:true});this.callbacks.level(0);}
 sendText(text:string){if(!this.ready||this.stopped)return false;this.lastRequest=text;this.inputId=crypto.randomUUID();this.inputText=text;this.newTurn=false;this.outputId=crypto.randomUUID();this.outputText='';this.callbacks.transcript('user',this.inputId,text);this.callbacks.state('thinking');this.session?.sendRealtimeInput({text});return true;}
 private fail(code:string){if(this.stopped)return;this.close();this.callbacks.error(code);}
 close(){if(this.stopped)return;this.stopped=true;this.abort.abort();for(const controller of this.toolControllers.values())controller.abort();this.toolControllers.clear();if(this.timer)clearTimeout(this.timer);if(this.timeout)clearTimeout(this.timeout);this.session?.close();this.session=null;this.clearAudio();if(typeof AudioWorkletNode!=='undefined'&&this.processor instanceof AudioWorkletNode)this.processor.port.onmessage=null;else if(this.processor)(this.processor as ScriptProcessorNode).onaudioprocess=null;this.processor?.disconnect();this.source?.disconnect();this.stream.getTracks().forEach(t=>t.stop());if(this.context.state!=='closed')void this.context.close();}
}
