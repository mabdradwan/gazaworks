import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
const mocks=vi.hoisted(()=>({rpc:vi.fn(),send:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("@/lib/supabase/admin",()=>({supabaseAdmin:()=>({rpc:mocks.rpc})}));
vi.mock("@/lib/email/provider",()=>({emailIsConfigured:()=>true,emailProvider:()=>({send:mocks.send})}));
import {POST} from "@/app/api/contact/route";
import {consumeContactQuota} from "@/lib/contact-quota";
const payload={name:"Test Client",email:"test@example.test",topic:"general",message:"A synthetic project inquiry."};
function request(body:unknown=payload,extra:Record<string,string>={}){
  return new NextRequest("https://app.test/api/contact",{method:"POST",headers:{host:"app.test",origin:"https://app.test","content-type":"application/json",...extra},body:JSON.stringify(body)});
}
beforeEach(()=>{vi.resetAllMocks();vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY","synthetic-test-secret");vi.stubEnv("NETLIFY","true");mocks.rpc.mockResolvedValue({error:null});mocks.send.mockResolvedValue(undefined)});
afterEach(()=>vi.unstubAllEnvs());
describe("contact delivery boundary",()=>{
  it("never calls the email provider after a quota rejection",async()=>{
    mocks.rpc.mockResolvedValue({error:{message:"rate_limited"}});
    const result=await POST(request());
    expect(result.status).toBe(429);expect(result.headers.get("Retry-After")).toBe("600");expect(mocks.send).not.toHaveBeenCalled();
  });
  it("fails closed when shared quota storage or credentials are unavailable",async()=>{
    mocks.rpc.mockRejectedValue(new Error("private backend failure"));
    expect((await POST(request())).status).toBe(503);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY","");
    expect((await POST(request())).status).toBe(503);expect(mocks.send).not.toHaveBeenCalled();
  });
  it("ignores a visitor's forwarded address and hashes only the trusted connection",async()=>{
    await consumeContactQuota(new Headers({"x-nf-client-connection-ip":"192.0.2.1","x-forwarded-for":"192.0.2.9"}));
    const first=mocks.rpc.mock.calls[0][1].identity_hash;
    await consumeContactQuota(new Headers({"x-nf-client-connection-ip":"192.0.2.1","x-forwarded-for":"192.0.2.10"}));
    expect(mocks.rpc.mock.calls[1][1].identity_hash).toBe(first);expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(mocks.rpc.mock.calls)).not.toContain("192.0.2.");
    await consumeContactQuota(new Headers({"x-nf-client-connection-ip":"192.0.2.2"}));
    expect(mocks.rpc.mock.calls[2][1].identity_hash).not.toBe(first);
  });
  it("does not trust provider-specific headers outside Netlify",async()=>{
    vi.stubEnv("NETLIFY","false");
    await consumeContactQuota(new Headers({"x-nf-client-connection-ip":"192.0.2.1"}));
    await consumeContactQuota(new Headers({"x-nf-client-connection-ip":"192.0.2.2"}));
    expect(mocks.rpc.mock.calls[0][1]).toEqual(mocks.rpc.mock.calls[1][1]);
  });
  it("rejects invalid and foreign requests before storage or delivery",async()=>{
    expect((await POST(request(payload,{origin:"https://foreign.test"}))).status).toBe(403);
    expect((await POST(request({...payload,message:"short"}))).status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();expect(mocks.send).not.toHaveBeenCalled();
  });
  it("silently discards honeypot submissions without delivering them",async()=>{
    expect((await POST(request({...payload,website:"bot.example"}))).status).toBe(200);
    expect(mocks.rpc).not.toHaveBeenCalled();expect(mocks.send).not.toHaveBeenCalled();
  });
  it("reports delivery failure when the email provider rejects an allowed request",async()=>{
    vi.stubEnv("CONTACT_RECIPIENT_EMAIL","support@example.test");
    mocks.send.mockRejectedValue(new Error("provider failure"));
    expect((await POST(request())).status).toBe(503);
    expect(mocks.send).toHaveBeenCalledOnce();
  });
});
