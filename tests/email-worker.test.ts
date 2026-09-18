import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
const fake=vi.hoisted(()=>({rpc:vi.fn(),from:vi.fn(),send:vi.fn(),admin:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("@/lib/supabase/admin",()=>({supabaseAdmin:fake.admin}));
vi.mock("@/lib/email/provider",()=>({ResendEmailProvider:class{send=fake.send;}}));
import {runEmailWorker} from "@/lib/email/worker";
const envelope={from:"notice@example.test",to:"user@example.test",subject:"Frozen subject",html:"<p>Frozen</p>",text:"Frozen"};
const job={id:"queue-fixed-id",claim_token:"lease-token",kind:"security_alert",locale:"en",recipient:envelope.to,envelope};
beforeEach(()=>{
 vi.resetAllMocks();
 vi.stubEnv("EMAIL_PROVIDER","resend");vi.stubEnv("EMAIL_DELIVERY_ENABLED","true");vi.stubEnv("VERCEL_ENV","production");
 vi.stubEnv("RESEND_API_KEY","synthetic-key");vi.stubEnv("EMAIL_FROM","notice@example.test");vi.stubEnv("NEXT_PUBLIC_APP_URL","https://example.test");
 fake.admin.mockReturnValue({rpc:fake.rpc,from:fake.from});
 fake.rpc.mockImplementation(async(name:string)=>({error:null,data:name==="gw_claim_emails"?[job]:name==="gw_prepare_email"?envelope:{status:"sent"}}));
 fake.send.mockResolvedValue({status:"accepted",providerId:"provider-id"});
});
afterEach(()=>vi.unstubAllEnvs());
describe("email worker orchestration",()=>{
 it("does not claim jobs or contact a provider while delivery is disabled",async()=>{
  vi.stubEnv("EMAIL_DELIVERY_ENABLED","false");
  expect(await runEmailWorker()).toEqual({enabled:false,processed:0});
  expect(fake.admin).not.toHaveBeenCalled();expect(fake.send).not.toHaveBeenCalled();
 });
 it("revalidates a saved envelope and uses the same queue idempotency key",async()=>{
  expect(await runEmailWorker()).toEqual({enabled:true,processed:1});
  expect(fake.rpc).toHaveBeenCalledWith("gw_prepare_email",{outbox_id:job.id,token:job.claim_token,payload:envelope});
  expect(fake.send).toHaveBeenCalledWith(envelope,"gazaworks-email/queue-fixed-id");
  expect(fake.from).not.toHaveBeenCalled();
  expect(fake.rpc).toHaveBeenLastCalledWith("gw_finish_email",{outbox_id:job.id,token:job.claim_token,outcome:"accepted",message_id:"provider-id",error_code:null});
 });
 it("does not send when the destination is no longer valid",async()=>{
  fake.rpc.mockImplementation(async(name:string)=>name==="gw_prepare_email"?{error:{message:"recipient_unavailable"},data:null}:{error:null,data:name==="gw_claim_emails"?[job]:{}});
  await runEmailWorker();expect(fake.send).not.toHaveBeenCalled();
  expect(fake.rpc).toHaveBeenLastCalledWith("gw_finish_email",expect.objectContaining({outcome:"suppressed",error_code:"recipient_unavailable"}));
 });
 it("keeps transient failures eligible for retry without marking them sent",async()=>{
  fake.send.mockResolvedValue({status:"retry",code:"provider_http_503"});
  await runEmailWorker();
  expect(fake.rpc).toHaveBeenLastCalledWith("gw_finish_email",expect.objectContaining({outcome:"retry",message_id:null,error_code:"provider_http_503"}));
 });
 it("fails the job request if recording provider acceptance fails",async()=>{
  fake.rpc.mockImplementation(async(name:string)=>({error:name==="gw_finish_email"?{message:"database unavailable"}:null,data:name==="gw_claim_emails"?[job]:name==="gw_prepare_email"?envelope:null}));
  await expect(runEmailWorker()).rejects.toThrow("email_finish_failed");
  expect(fake.send).toHaveBeenCalledTimes(1);
 });
 it("respects disabled templates before any provider call",async()=>{
  fake.rpc.mockImplementation(async(name:string)=>({error:null,data:name==="gw_claim_emails"?[{...job,envelope:null}]:{}}));
  const builder={select:vi.fn(),eq:vi.fn(),maybeSingle:vi.fn().mockResolvedValue({error:null,data:{subject:"Disabled",body_html:"<p>Disabled</p>",body_text:null,enabled:false}})};
  builder.select.mockReturnValue(builder);builder.eq.mockReturnValue(builder);fake.from.mockReturnValue(builder);
  await runEmailWorker();expect(fake.send).not.toHaveBeenCalled();
  expect(fake.rpc).toHaveBeenLastCalledWith("gw_finish_email",expect.objectContaining({outcome:"suppressed",error_code:"template_disabled"}));
 });
});
