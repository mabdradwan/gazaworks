import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {hasAIConsent} from "@/lib/ai/consent-policy";
import {isLocale} from "@/lib/i18n";
import {transcribeAudio} from "@/lib/ai/transcribe";
export const runtime="nodejs";
const limits=new Map<string,{count:number;until:number}>();let inFlight=0;
export async function POST(req:NextRequest){
 try{
  if(Number(req.headers.get("content-length"))>3_000_000)return NextResponse.json({error:"audio_too_large"},{status:413});
  const locale=req.nextUrl.searchParams.get("locale")??"en";
  if(!isLocale(locale)||req.headers.get("x-ai-consent")!=="true")return NextResponse.json({error:"consent_required"},{status:403});
  if(req.headers.get("content-type")!=="audio/wav")return NextResponse.json({error:"invalid_audio"},{status:400});
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(user&&!hasAIConsent(user.user_metadata))return NextResponse.json({error:"consent_required"},{status:403});
  const now=Date.now();for(const [key,value] of limits)if(value.until<now)limits.delete(key);
  const key=user?.id??createHash("sha256").update(req.headers.get("x-nf-client-connection-ip")??req.headers.get("x-forwarded-for")?.split(",")[0]??"unknown").digest("hex"),limit=limits.get(key)??{count:0,until:now+3600000};
  if(limit.count>=(user?60:10)||limits.size>10000||inFlight>=4)return NextResponse.json({error:"rate_limited"},{status:429});
  const chunks:Uint8Array[]=[];let size=0;const reader=req.body?.getReader();if(!reader)return NextResponse.json({error:"invalid_audio"},{status:400});
  while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>3_000_000){await reader.cancel();return NextResponse.json({error:"audio_too_large"},{status:413})}chunks.push(part.value)}
  const audio=Buffer.concat(chunks);if(audio.length<44||audio.toString("ascii",0,4)!=="RIFF"||audio.toString("ascii",8,12)!=="WAVE")return NextResponse.json({error:"invalid_audio"},{status:400});
  if(user){const {error}=await supabaseAdmin().rpc("gw_ai_quota",{actor:user.id});if(error)return NextResponse.json({error:"rate_limited"},{status:429})}
  limit.count++;limits.set(key,limit);inFlight++;
  try{return NextResponse.json({text:await transcribeAudio(audio,locale)},{headers:{"Cache-Control":"no-store"}})}finally{inFlight--}
 }catch{return NextResponse.json({error:"transcription_unavailable"},{status:503})}
}
