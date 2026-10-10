import {beforeEach,describe,it,expect,vi} from "vitest";
import {NextRequest} from "next/server";
const mocks=vi.hoisted(()=>({user:vi.fn(),quota:vi.fn(),transcribe:vi.fn()}));
vi.mock("@/lib/supabase/server",()=>({supabaseServer:async()=>({auth:{getUser:mocks.user}})}));
vi.mock("@/lib/supabase/admin",()=>({supabaseAdmin:()=>({rpc:mocks.quota})}));
vi.mock("@/lib/ai/transcribe",()=>({transcribeAudio:mocks.transcribe}));
import {POST} from "@/app/api/assistant/transcribe/route";
import {wavAudio} from "@/lib/voice-capture";
import {aiConsentMetadata} from "@/lib/ai/consent-policy";
async function request(consent=true,type="audio/wav",body?:Blob){return new NextRequest("https://preview.test/api/assistant/transcribe?locale=ar",{method:"POST",headers:{"content-type":type,"x-ai-consent":String(consent)},body:body??wavAudio([new Float32Array(480)],48000)})}
beforeEach(()=>{vi.resetAllMocks();mocks.user.mockResolvedValue({data:{user:{id:"synthetic-member",user_metadata:aiConsentMetadata(true)}}});mocks.quota.mockResolvedValue({error:null});mocks.transcribe.mockResolvedValue("غيّر سنوات الخبرة إلى خمسة")});
describe("voice transcription boundary",()=>{
 it("rejects missing explicit consent before calling AI",async()=>{expect((await POST(await request(false))).status).toBe(403);expect(mocks.transcribe).not.toHaveBeenCalled()});
 it("respects account opt-out",async()=>{mocks.user.mockResolvedValue({data:{user:{id:"synthetic-member",user_metadata:aiConsentMetadata(false)}}});expect((await POST(await request())).status).toBe(403);expect(mocks.transcribe).not.toHaveBeenCalled()});
 it("rejects invalid audio before consuming quota",async()=>{expect((await POST(await request(true,"audio/wav",new Blob(["invalid"])))).status).toBe(400);expect(mocks.quota).not.toHaveBeenCalled()});
 it("uses the verified actor quota and returns transcription without account mutations",async()=>{const r=await POST(await request());expect(r.status).toBe(200);expect(mocks.quota).toHaveBeenCalledWith("gw_ai_quota",{actor:"synthetic-member"});expect(await r.json()).toEqual({text:"غيّر سنوات الخبرة إلى خمسة"})});
 it("refuses exhausted quota before calling AI",async()=>{mocks.quota.mockResolvedValue({error:{message:"rate_limited"}});expect((await POST(await request())).status).toBe(429);expect(mocks.transcribe).not.toHaveBeenCalled()});
});
