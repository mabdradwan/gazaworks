import {beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
const mocks=vi.hoisted(()=>({getUser:vi.fn(),read:vi.fn(),signOut:vi.fn(),record:vi.fn()}));
vi.mock("@/lib/supabase/server",()=>({supabaseServer:async()=>({auth:{getUser:mocks.getUser,signOut:mocks.signOut},from:()=>({select:()=>({eq:()=>({maybeSingle:mocks.read})})})})}));
vi.mock("@/lib/security-events",()=>({recordLoginEvent:mocks.record,requestNetworkMetadata:()=>({ip:null,userAgent:null})}));
import {POST} from "../src/app/api/security/session/route";
beforeEach(()=>{vi.resetAllMocks();mocks.getUser.mockResolvedValue({data:{user:{id:"fictional",app_metadata:{provider:"email"}}}})});
describe("workspace entry",()=>{
 it("rejects an unauthenticated visitor",async()=>{mocks.getUser.mockResolvedValue({data:{user:null}});expect((await POST(new NextRequest("https://app.test/api/security/session"))).status).toBe(401);expect(mocks.read).not.toHaveBeenCalled()});
 it.each(["suspended","banned"])("rejects %s before recording success",async status=>{mocks.read.mockResolvedValue({data:{account_status:status},error:null});expect((await POST(new NextRequest("https://app.test/api/security/session"))).status).toBe(403);expect(mocks.signOut).toHaveBeenCalledWith({scope:"local"});expect(mocks.record).not.toHaveBeenCalled()});
 it("distinguishes missing profile from unavailable database",async()=>{mocks.read.mockResolvedValue({data:null,error:null});expect((await POST(new NextRequest("https://app.test/api/security/session"))).status).toBe(409);mocks.read.mockResolvedValue({data:null,error:{code:"connection"}});expect((await POST(new NextRequest("https://app.test/api/security/session"))).status).toBe(503);expect(mocks.record).not.toHaveBeenCalled()});
 it.each(["individual","team","client"])("admits an active %s",async type=>{mocks.read.mockResolvedValue({data:{account_status:"active",account_type:type},error:null});const result=await POST(new NextRequest("https://app.test/api/security/session"));expect(result.status).toBe(200);expect(mocks.record).toHaveBeenCalledOnce()});
});
