import {beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
import {emptyCV} from "@/domain/cv";
const mocks=vi.hoisted(()=>({generate:vi.fn(),getUser:vi.fn(),directory:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("@/lib/ai/generate",()=>({generateDraft:mocks.generate}));
vi.mock("@/lib/supabase/server",()=>({supabaseServer:async()=>({auth:{getUser:mocks.getUser}})}));
vi.mock("@/lib/directory",()=>({directoryAccess:mocks.directory}));
import {POST as assistant} from "@/app/api/ai/route";
import {POST as search} from "@/app/api/ai/talent-search/route";
import {POST as cv} from "@/app/api/cv/route";
function request(path:string,body:unknown){return new NextRequest(`https://app.test/api/${path}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});}
beforeEach(()=>{
 vi.resetAllMocks();
 mocks.getUser.mockResolvedValue({data:{user:{id:"synthetic-actor"}}});
 mocks.generate.mockResolvedValue({text:"Draft",provider:"gemini",model:"synthetic-model",generationId:"synthetic-generation"});
});
describe("external AI consent boundary",()=>{
 for(const consent of [undefined,false,"true",1]){
  it(`rejects assistant, talent search and CV without explicit boolean consent (${String(consent)})`,async()=>{
   const shared={prompt:"A synthetic project question",locale:"en",consentToExternalAI:consent};
   expect((await assistant(request("ai",{...shared,task:"faq"}))).status).toBe(400);
   expect((await search(request("ai/talent-search",shared))).status).toBe(400);
   expect((await cv(request("cv",{cv:{...emptyCV,name:"Test",title:"Designer"},locale:"en",consentToExternalAI:consent}))).status).toBe(400);
   expect(mocks.generate).not.toHaveBeenCalled();
   expect(mocks.directory).not.toHaveBeenCalled();
  });
 }
 it("requires authentication even with consent",async()=>{
  mocks.getUser.mockResolvedValue({data:{user:null}});
  expect((await assistant(request("ai",{task:"faq",prompt:"A synthetic question",locale:"en",consentToExternalAI:true}))).status).toBe(401);
  expect((await cv(request("cv",{cv:{...emptyCV,name:"Test",title:"Designer"},locale:"en",consentToExternalAI:true}))).status).toBe(401);
  expect(mocks.generate).not.toHaveBeenCalled();
 });
 it("returns only a reviewable assistant draft after explicit consent",async()=>{
  const response=await assistant(request("ai",{task:"faq",prompt:"A synthetic question",locale:"en",consentToExternalAI:true}));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({draft:true,requiresConfirmation:true,generationId:"synthetic-generation"});
  expect(mocks.generate).toHaveBeenCalledOnce();
 });
 it("does not authorize a talent search for non-client accounts",async()=>{
  mocks.directory.mockResolvedValue(null);
  expect((await search(request("ai/talent-search",{prompt:"A synthetic query",locale:"en",consentToExternalAI:true}))).status).toBe(403);
  expect(mocks.generate).not.toHaveBeenCalled();
 });
 it("keeps generated CVs as suggestions rather than publishing them",async()=>{
  const generated={...emptyCV,name:"Test",title:"Designer",summary:"Only supplied facts"};
  mocks.generate.mockResolvedValue({text:JSON.stringify(generated),generationId:"synthetic-generation"});
  const response=await cv(request("cv",{cv:generated,locale:"en",consentToExternalAI:true}));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({cv:generated,requiresConfirmation:true});
 });
});
