import {beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
const mocks=vi.hoisted(()=>({
  exchange:vi.fn(),getUser:vi.fn(),profile:vi.fn(),signOut:vi.fn(),record:vi.fn()
}));
vi.mock("@/lib/supabase/server",()=>({supabaseServer:async()=>({auth:{
  exchangeCodeForSession:mocks.exchange,getUser:mocks.getUser,signOut:mocks.signOut
}})}));
vi.mock("@/lib/supabase/admin",()=>({supabaseAdmin:()=>({from:()=>({
  select:()=>({eq:()=>({maybeSingle:mocks.profile})})
})})}));
vi.mock("@/lib/security-events",()=>({
  recordLoginEvent:mocks.record,requestNetworkMetadata:()=>({ip:null,userAgent:null})
}));
import {GET} from "@/app/auth/callback/route";

beforeEach(()=>{
  vi.resetAllMocks();
  mocks.exchange.mockResolvedValue({error:null});
  mocks.getUser.mockResolvedValue({data:{user:{id:"synthetic-user",app_metadata:{provider:"email"}}}});
  mocks.profile.mockResolvedValue({data:{id:"synthetic-user",account_type:"individual",account_status:"active"},error:null});
});
describe("callback redirects preserve the browser origin",()=>{
  for(const locale of ["ar","en","tr","es","fr","de"]){
    it(`handles a missing code in ${locale} without redirecting to the internal host`,async()=>{
      const response=await GET(new NextRequest(`https://internal-deploy.test/auth/callback?locale=${locale}`));
      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe(`/${locale}/auth?error=callback`);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(mocks.exchange).not.toHaveBeenCalled();
    });
  }
  it("keeps a failed code exchange on the browser's origin",async()=>{
    mocks.exchange.mockResolvedValue({error:new Error("Synthetic expired code")});
    const response=await GET(new NextRequest("https://internal-deploy.test/auth/callback?locale=ar&code=synthetic"));
    expect(response.headers.get("location")).toBe("/ar/auth?error=callback");
    expect(mocks.getUser).not.toHaveBeenCalled();
  });
  it("returns successful recovery to the localized update form on the same origin",async()=>{
    const url=new URL("https://internal-deploy.test/auth/callback");
    url.searchParams.set("locale","ar");
    url.searchParams.set("code","synthetic");
    url.searchParams.set("next","/ar/auth/reset?mode=update");
    const response=await GET(new NextRequest(url));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/ar/auth/reset?mode=update");
    expect(mocks.record).toHaveBeenCalledOnce();
  });
  it.each(["individual","team","client"])("opens projects for a %s account with no return destination",async accountType=>{
    mocks.profile.mockResolvedValue({data:{id:"synthetic-user",account_type:accountType,account_status:"active"},error:null});
    const response=await GET(new NextRequest("https://internal-deploy.test/auth/callback?locale=ar&code=synthetic"));
    expect(response.headers.get("location")).toBe("/ar/dashboard/projects");
  });
  it("keeps the OAuth session while a new user chooses an immutable account type",async()=>{
    mocks.profile.mockResolvedValue({data:null,error:null});
    const response=await GET(new NextRequest("https://internal-deploy.test/auth/callback?locale=ar&code=synthetic"));
    expect(response.headers.get("location")).toBe("/ar/auth/complete?next=%2Far%2Fdashboard%2Fprojects");
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
  it("rejects an external return URL even after a valid exchange",async()=>{
    const url=new URL("https://internal-deploy.test/auth/callback");
    url.searchParams.set("locale","ar");
    url.searchParams.set("code","synthetic");
    url.searchParams.set("next","https://attacker.test");
    const response=await GET(new NextRequest(url));
    expect(response.headers.get("location")).toBe("/ar/dashboard/projects");
  });
});
