import 'server-only';
import {GoogleGenAI} from '@google/genai';
import {liveVoiceConfig,LIVE_DURATION_SECONDS} from '@/domain/live-voice';
import type {Locale} from '@/lib/i18n';
export class LiveUnavailable extends Error{constructor(public code:string){super(code)}}
let cached:{model:string;until:number}|null=null;
async function modelFor(key:string){
 if(process.env.GEMINI_LIVE_MODEL)return process.env.GEMINI_LIVE_MODEL.replace(/^models\//,'');
 if(cached&&cached.until>Date.now())return cached.model;
 const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000',{headers:{'x-goog-api-key':key},signal:AbortSignal.timeout(12000),redirect:'error',cache:'no-store'});
 if(!response.ok)throw new LiveUnavailable('live_unavailable');
 const data=await response.json();
 const available=(data.models??[]).filter((m:{name:string;supportedGenerationMethods?:string[]})=>m.supportedGenerationMethods?.includes('bidiGenerateContent')).map((m:{name:string})=>m.name.replace(/^models\//,''));
 const preferred=['gemini-3.8-live','gemini-3.1-flash-live-preview','gemini-2.5-flash-native-audio-preview-12-2025','gemini-2.5-flash-native-audio-latest'];
 const model=preferred.find(m=>available.includes(m))??available.filter((m:string)=>/native-audio|flash-live/.test(m)).sort().reverse()[0];if(!model)throw new LiveUnavailable('live_model_unavailable');cached={model,until:Date.now()+300000};return model;
}
export async function createLiveSession(locale:Locale,member:boolean){
 if(process.env.AI_PROVIDER!=='gemini'||!process.env.GEMINI_API_KEY)throw new LiveUnavailable('live_not_configured');
 const key=process.env.GEMINI_API_KEY,model=await modelFor(key),config=liveVoiceConfig(locale,member),expiresAt=new Date(Date.now()+LIVE_DURATION_SECONDS*1000).toISOString();
 try{
  const client=new GoogleGenAI({apiKey:key,httpOptions:{apiVersion:'v1alpha',timeout:15000}});
  const token=await client.authTokens.create({config:{uses:1,expireTime:expiresAt,newSessionExpireTime:new Date(Date.now()+60000).toISOString(),liveConnectConstraints:{model,config}}});
  if(!token.name)throw new LiveUnavailable('live_unavailable');
  return {token:token.name,model,apiVersion:'v1alpha',config,expiresAt,durationSeconds:LIVE_DURATION_SECONDS};
 }catch(e){if(e instanceof LiveUnavailable)throw e;const status=(e as {status?:number}).status;throw new LiveUnavailable(status===429?'live_quota_exceeded':'live_unavailable')}
}
