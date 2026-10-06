import {NextRequest,NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {supabaseServer} from '@/lib/supabase/server';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {hasAIConsent} from '@/lib/ai/consent-policy';
import {createLiveSession,LiveUnavailable} from '@/lib/ai/live-session';
export const runtime='nodejs';
const schema=z.object({locale:z.enum(['ar','en','tr','es','fr','de']),consentToExternalAI:z.literal(true)}).strict();
const limits=new Map<string,{count:number;until:number}>();let inFlight=0;
export async function POST(req:NextRequest){
 try{
  const input=schema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(user&&!hasAIConsent(user.user_metadata))return NextResponse.json({error:'consent_required'},{status:403});
  const now=Date.now();for(const [key,value] of limits)if(value.until<now)limits.delete(key);
  const key=user?.id??createHash('sha256').update(req.headers.get('x-nf-client-connection-ip')??req.headers.get('x-forwarded-for')?.split(',')[0]??'unknown').digest('hex'),limit=limits.get(key)??{count:0,until:now+3600000};
  if(limits.size>10000||inFlight>=4||limit.count>=(user?6:2))return NextResponse.json({error:'live_quota_exceeded'},{status:429});
  if(user){const {error}=await supabaseAdmin().rpc('gw_ai_quota',{actor:user.id});if(error)return NextResponse.json({error:'live_quota_exceeded'},{status:429})}
  limit.count++;limits.set(key,limit);inFlight++;
  try{return NextResponse.json(await createLiveSession(input.locale,Boolean(user)),{headers:{'Cache-Control':'no-store, private'}})}finally{inFlight--}
 }catch(e){return NextResponse.json({error:e instanceof z.ZodError?'invalid_request':e instanceof LiveUnavailable?e.code:'live_unavailable'},{status:e instanceof z.ZodError?400:e instanceof LiveUnavailable&&e.code==='live_quota_exceeded'?429:503})}
}
