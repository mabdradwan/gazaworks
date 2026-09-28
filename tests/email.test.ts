import {afterEach,describe,expect,it,vi} from "vitest";
import {emailConfiguration,type EmailEnvelope} from "@/domain/email";
vi.mock("server-only",()=>({}));
import {BrevoEmailProvider,encodeBrevoMessageId} from "@/lib/email/provider";
import {renderEmail,escapeEmailHtml} from "@/lib/email/templates";
import {boundedWebhookBody,emailWebhookEventId,verifyEmailWebhook} from "@/lib/email/webhook";
import {locales} from "@/lib/i18n";
const config={EMAIL_PROVIDER:"brevo",EMAIL_DELIVERY_ENABLED:"true",BREVO_API_KEY:"synthetic-test-key",BREVO_SENDER_EMAIL:"notice@example.test",NEXT_PUBLIC_APP_URL:"https://example.test",CONTEXT:"production"};
const envelope:EmailEnvelope={from:"notice@example.test",to:"user@example.test",subject:"Notice",html:"<p>Notice</p>",text:"Notice"};
const jobId="550e8400-e29b-41d4-a716-446655440000";
afterEach(()=>vi.restoreAllMocks());
describe("email configuration and rendering",()=>{
 it("is disabled without explicit provider and delivery switches",()=>{
  expect(emailConfiguration({})).toBeNull();
  expect(emailConfiguration({...config,EMAIL_DELIVERY_ENABLED:"false"})).toBeNull();
  expect(emailConfiguration({...config,BREVO_API_KEY:""})).toBeNull();
 });
 it("requires explicit non-production sending authorization",()=>{
  expect(emailConfiguration({...config,CONTEXT:"deploy-preview"})).toBeNull();
  expect(emailConfiguration({...config,CONTEXT:"deploy-preview",EMAIL_ALLOW_NON_PRODUCTION:"true"})).toMatchObject({origin:"https://example.test"});
 });
 it.each(["http://example.test","https://user:pass@example.test","https://example.test/untrusted","https://example.test?redirect=other"])("rejects unsafe application origin %s",origin=>{
  expect(emailConfiguration({...config,NEXT_PUBLIC_APP_URL:origin})).toBeNull();
 });
 it.each(["notice@example.test\r\nBcc:other@example.test","not-an-address","GazaWorks <invalid>"])("rejects invalid sender %s",from=>{
  expect(emailConfiguration({...config,BREVO_SENDER_EMAIL:from})).toBeNull();
 });
 it.each(locales)("renders a complete localized notice in %s",locale=>{
  const rendered=renderEmail({kind:"appeal_update",locale,recipient:envelope.to,from:envelope.from,origin:"https://example.test"});
  expect(rendered?.html).toContain(`lang="${locale}" dir="${locale==="ar"?"rtl":"ltr"}"`);
  expect(rendered?.text).toContain(`https://example.test/${locale}/dashboard/disputes`);
  expect(rendered?.subject).not.toContain("undefined");
 });
 it("honors disabled templates and supports only known placeholders",()=>{
  const input={kind:"security_alert" as const,locale:"en",recipient:envelope.to,from:envelope.from,origin:"https://example.test"};
  expect(renderEmail({...input,template:{subject:"{{subject}}",body_html:"{{message}}",body_text:null,enabled:false}})).toBeNull();
  expect(()=>renderEmail({...input,template:{subject:"{{user.email}}",body_html:"<p>Notice</p>",body_text:null,enabled:true}})).toThrow("unknown_template_placeholder");
  expect(()=>renderEmail({...input,template:{subject:"Injected\r\nHeader",body_html:"<p>Notice</p>",body_text:null,enabled:true}})).toThrow();
  expect(escapeEmailHtml('<a x="&">')).toBe('&lt;a x=&quot;&amp;&quot;&gt;');
  expect(renderEmail({...input,template:{subject:"{{platform_name}} — {{subject}}",body_html:'<a href="{{dashboard_url}}">{{message}}</a>',body_text:"{{message}}",enabled:true}})?.html).toContain("https://example.test/en/dashboard/security");
 });
});
describe("provider result semantics",()=>{
 it("sends the frozen payload and stable idempotency key, reporting only acceptance",async()=>{
  const transport=vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({messageId:"<provider-uuid@relay.example.test>"}),{status:201}));
  const provider=new BrevoEmailProvider("test-secret",config.BREVO_SENDER_EMAIL,transport);
  expect(await provider.send(envelope,jobId)).toEqual({status:"accepted",providerId:encodeBrevoMessageId("<provider-uuid@relay.example.test>")});
  const [url,request]=transport.mock.calls[0];
  expect(url).toBe("https://api.brevo.com/v3/smtp/email");
  expect(new Headers(request?.headers).get("api-key")).toBe("test-secret");
  expect(JSON.parse(request?.body as string)).toEqual({sender:{email:config.BREVO_SENDER_EMAIL,name:"GazaWorks"},to:[{email:envelope.to}],subject:envelope.subject,htmlContent:envelope.html,textContent:envelope.text,headers:{idempotencyKey:jobId}});
 });
 it.each([408,429,500,503])("retries transient provider response %s",async status=>{
  const transport=vi.fn<typeof fetch>().mockResolvedValue(new Response("",{status}));
  expect(await new BrevoEmailProvider("test",config.BREVO_SENDER_EMAIL,transport).send(envelope,jobId)).toEqual({status:"retry",code:`provider_http_${status}`});
 });
 it("does not mark invalid requests or malformed confirmations as sent",async()=>{
  const transport=vi.fn<typeof fetch>().mockResolvedValueOnce(new Response("private recipient error",{status:422})).mockResolvedValueOnce(new Response("{}",{status:201})).mockRejectedValueOnce(new Error("private key and email in error")).mockResolvedValueOnce(new Response(JSON.stringify({code:"duplicate_parameter"}),{status:400}));
  const provider=new BrevoEmailProvider("test",config.BREVO_SENDER_EMAIL,transport);
  expect(await provider.send(envelope,jobId)).toEqual({status:"failed",code:"provider_http_422"});
  expect(await provider.send(envelope,jobId)).toEqual({status:"retry",code:"provider_invalid_response"});
  expect(await provider.send(envelope,jobId)).toEqual({status:"retry",code:"provider_network_error"});
  expect(await provider.send(envelope,jobId)).toEqual({status:"retry",code:"provider_duplicate"});
 });
});
describe("authenticated provider callbacks",()=>{
 const secret="a-secret-token-long-enough-for-webhooks";
 const body='{"event":"delivered","message-id":"<provider@relay.example.test>","ts":1600000000}';
 const headers=new Headers({authorization:`Bearer ${secret}`});
 it("checks the configured bearer token and consistent event identity",()=>{
  expect(verifyEmailWebhook(headers,secret)).toBe(true);
  expect(emailWebhookEventId(body)).toBe(emailWebhookEventId(body));
  expect(encodeBrevoMessageId("<provider@relay.example.test>")).toMatch(/^[a-zA-Z0-9_-]+$/);
  expect(encodeBrevoMessageId("<provider@relay.example.test>")).toBe(encodeBrevoMessageId("provider@relay.example.test"));
 });
 it("rejects wrong, short and missing bearer tokens",()=>{
  expect(verifyEmailWebhook(headers,secret+"x")).toBe(false);
  expect(verifyEmailWebhook(headers,"short")).toBe(false);
  expect(verifyEmailWebhook(new Headers(),secret)).toBe(false);
 });
 it("enforces a body size limit even when content-length is absent",async()=>{
  expect(await boundedWebhookBody(new Request("https://example.test",{method:"POST",body}))).toBe(body);
  await expect(boundedWebhookBody(new Request("https://example.test",{method:"POST",body:"x".repeat(65537)}))).rejects.toThrow("webhook_too_large");
 });
});
