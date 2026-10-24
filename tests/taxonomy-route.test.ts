import {beforeEach,describe,expect,it,vi} from "vitest";
const mocks=vi.hoisted(()=>({getUser:vi.fn(),from:vi.fn(),order:vi.fn()}));
vi.mock("@/lib/supabase/server",()=>({supabaseServer:async()=>({auth:{getUser:mocks.getUser},from:mocks.from})}));
import {GET} from "../src/app/api/taxonomy/route";
beforeEach(()=>{vi.resetAllMocks();mocks.from.mockReturnValue({select:()=>({eq:()=>({order:mocks.order})})});});
describe("taxonomy access",()=>{
 it("returns 401 for guests before querying policies that require an authenticated role",async()=>{mocks.getUser.mockResolvedValue({data:{user:null}});expect((await GET()).status).toBe(401);expect(mocks.from).not.toHaveBeenCalled()});
 it("returns available categories and skills for signed-in users",async()=>{mocks.getUser.mockResolvedValue({data:{user:{id:"test-user"}}});mocks.order.mockResolvedValueOnce({data:[{id:"category"}],error:null}).mockResolvedValueOnce({data:[{id:"skill"}],error:null});const response=await GET();expect(response.status).toBe(200);expect(await response.json()).toEqual({categories:[{id:"category"}],skills:[{id:"skill"}]})});
 it("reports a temporary backend failure without exposing database details",async()=>{mocks.getUser.mockResolvedValue({data:{user:{id:"test-user"}}});mocks.order.mockResolvedValue({data:null,error:{message:"private database details"}});const response=await GET();expect(response.status).toBe(503);expect(await response.json()).toEqual({error:"taxonomy_unavailable"})});
});
