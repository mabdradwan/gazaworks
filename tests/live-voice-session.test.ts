import {beforeEach,describe,it,expect,vi} from 'vitest';
import {NextRequest} from 'next/server';
const mocks=vi.hoisted(()=>({user:vi.fn(),quota:vi.fn(),create:vi.fn()}));
vi.mock('@/lib/supabase/server',()=>({supabaseServer:async()=>({auth:{getUser:mocks.user}})}));
vi.mock('@/lib/supabase/admin',()=>({supabaseAdmin:()=>({rpc:mocks.quota})}));
vi.mock('@/lib/ai/live-session',()=>({createLiveSession:mocks.create,LiveUnavailable:class extends Error{}}));
import {POST} from '@/app/api/assistant/live/session/route';
import {aiConsentMetadata} from '@/lib/ai/consent-policy';
import {liveVoiceConfig} from '@/domain/live-voice';
function req(body:unknown){return new NextRequest('https://preview.test/api/assistant/live/session',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}});}
beforeEach(()=>{vi.resetAllMocks();mocks.user.mockResolvedValue({data:{user:{id:crypto.randomUUID(),user_metadata:aiConsentMetadata(true)}}});mocks.quota.mockResolvedValue({error:null});mocks.create.mockResolvedValue({token:'short-lived-token',model:'test-live-model'});});
describe('live session security boundary',()=>{
 it('requires explicit consent before provisioning a token',async()=>{expect((await POST(req({locale:'ar'}))).status).toBe(400);expect(mocks.create).not.toHaveBeenCalled()});
 it('respects stored opt-out',async()=>{mocks.user.mockResolvedValue({data:{user:{id:'opted-out',user_metadata:aiConsentMetadata(false)}}});expect((await POST(req({locale:'ar',consentToExternalAI:true}))).status).toBe(403);expect(mocks.create).not.toHaveBeenCalled()});
 it('uses verified identity quota and returns no-store session',async()=>{const user=(await mocks.user()).data.user;const r=await POST(req({locale:'ar',consentToExternalAI:true}));expect(r.status).toBe(200);expect(mocks.quota).toHaveBeenCalledWith('gw_ai_quota',{actor:user.id});expect(mocks.create).toHaveBeenCalledWith('ar',true);expect(r.headers.get('cache-control')).toContain('no-store');expect(await r.json()).toEqual({token:'short-lived-token',model:'test-live-model'})});
 it('refuses exhausted quota before issuing a token',async()=>{mocks.quota.mockResolvedValue({error:{message:'rate_limited'}});expect((await POST(req({locale:'ar',consentToExternalAI:true}))).status).toBe(429);expect(mocks.create).not.toHaveBeenCalled()});
 it('gives visitors no account tools and members only the guarded account request',()=>{expect(liveVoiceConfig('ar',false).tools).toBeUndefined();expect(liveVoiceConfig('ar',true)).toMatchObject({tools:[{functionDeclarations:[{name:'account_request'}]}]});expect(liveVoiceConfig('ar',true).systemInstruction).toMatchObject({parts:[{text:expect.stringContaining('Never claim a change was saved unless the tool confirms saved')}]})});
});
