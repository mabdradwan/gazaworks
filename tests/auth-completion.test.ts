import {beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
const m=vi.hoisted(()=>({user:vi.fn(),profile:vi.fn(),rpc:vi.fn(),update:vi.fn()}));
vi.mock("@/lib/supabase/server",()=>({supabaseServer:async()=>({auth:{getUser:m.user,updateUser:m.update}})}));
vi.mock("@/lib/supabase/admin",()=>({supabaseAdmin:()=>({from:()=>({select:()=>({eq:()=>({maybeSingle:m.profile})})}),rpc:m.rpc})}));
import {POST} from "@/app/api/auth/complete/route";
const input={accountType:"individual",displayName:"Synthetic User",locale:"ar"};
function request(body:unknown=input){return new NextRequest("https://preview.test/api/auth/complete",{method:"POST",body:JSON.stringify(body)})}
beforeEach(()=>{vi.resetAllMocks();m.user.mockResolvedValue({data:{user:{id:"caller",email:"synthetic@example.test"}}});m.profile.mockResolvedValue({data:null,error:null});m.rpc.mockResolvedValue({error:null});m.update.mockResolvedValue({error:null})});
describe("OAuth account completion",()=>{
 it("cannot provision without a verified session",async()=>{m.user.mockResolvedValue({data:{user:null}});expect((await POST(request())).status).toBe(401);expect(m.rpc).not.toHaveBeenCalled()});
 it("cannot change an existing account type",async()=>{m.profile.mockResolvedValue({data:{id:"caller"},error:null});expect((await POST(request())).status).toBe(409);expect(m.rpc).not.toHaveBeenCalled()});
 it("rejects a client supplied owner or permissions",async()=>{expect((await POST(request({...input,actor:"other-user",role:"admin"}))).status).toBe(400);expect(m.rpc).not.toHaveBeenCalled()});
 it("provisions only the session owner",async()=>{expect((await POST(request())).status).toBe(200);expect(m.rpc).toHaveBeenCalledWith("gw_provision_profile",expect.objectContaining({actor:"caller",kind:"individual"}))});
});
