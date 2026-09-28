import {beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
const mocks=vi.hoisted(()=>({getUser:vi.fn(),directory:vi.fn()}));
vi.mock("@/lib/supabase/server",()=>({supabaseServer:async()=>({auth:{getUser:mocks.getUser}})}));
vi.mock("@/lib/directory",()=>({directoryAccess:mocks.directory}));
import {GET} from "../src/app/api/talent/route";

beforeEach(()=>vi.resetAllMocks());
describe("private directory access",()=>{
 it("returns 401 for a visitor before any privileged directory client is created",async()=>{
  mocks.getUser.mockResolvedValue({data:{user:null}});
  const result=await GET(new NextRequest("https://app.test/api/talent"));
  expect(result.status).toBe(401);expect(await result.json()).toEqual({error:"unauthorized"});
  expect(mocks.directory).not.toHaveBeenCalled();
 });
 it("returns 403 for a signed-in account without directory permission",async()=>{
  mocks.getUser.mockResolvedValue({data:{user:{id:"fictional-user"}}});mocks.directory.mockResolvedValue(null);
  const result=await GET(new NextRequest("https://app.test/api/talent"));
  expect(result.status).toBe(403);expect(await result.json()).toEqual({error:"client_required"});
 });
});
