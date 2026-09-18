import {afterEach,describe,expect,it,vi} from "vitest";
import {emailConfiguration,type EmailEnvelope} from "@/domain/email";
import {ResendEmailProvider} from "@/lib/email/provider";
import {renderEmail,escapeEmailHtml} from "@/lib/email/templates";
import {boundedWebhookBody,verifyEmailWebhook} from "@/lib/email/webhook";
import {locales} from "@/lib/i18n";
const config={EMAIL_PROVIDER:"resend",EMAIL_DELIVERY_ENABLED:"true",RESEND_API_KEY:"synthetic-test-key",EMAIL_FROM:"GazaWorks <notice@example.test>",NEXT_PUBLIC_APP_URL:"https://example.test",VERCEL_ENV:"production"};
const envelope:EmailEnvelope={from:"GazaWorks <notice@example.test>",to:"user@example.test",subject:"Notice",html:"<p>Notice</p>",text:"Notice"};
afterEach(()=>vi.restoreAllMocks());
describe("email configuration and rendering",()=>{
 it("is disabled without explicit provider and delivery switches",()=>{
  expect(emailConfiguration({})).toBeNull();
  expect(emailConfiguration({...config,EMAIL_DELIVERY_ENABLED:"false"})).toBeNull();
  expect(emailConfiguration({...config,RESEND_API_KEY:""})).toBeNull();
 });
 it("requires explicit non-production sending authorization",()=>{
  expect(emailConfiguration({...config,VERCEL_ENV:"preview"})).toBeNull();
  expect(emailConfiguration({...config,VERCEL_ENV:"preview",EMAIL_ALLOW_NON_PRODUCTION:"true"})).toMatchObject({origin:"https://example.test"});
 });
 it.each(["http://example.test","https://user:pass@example.test","https://example.test/untrusted","https://example.test?redirect=other"])("rejects unsafe application origin %s",origin=>{
  expect(emailConfiguration({...config,NEXT_PUBLIC_APP_URL:origin})).toBeNull();
 });
 it.each(["notice@example.test\r\nBcc:other@example.test","not-an-address","GazaWorks <invalid>"])("rejects invalid sender %s",from=>{
  expect(emailConfiguration({...config,EMAIL_FROM:from})).toBeNull();
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
  const transport=vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({id:"provider-uuid"}),{status:200}));
  const provider=new ResendEmailProvider("test-secret",transport);
  expect(await provider.send(envelope,"gazaworks-email/fixed-id")).toEqual({status:"accepted",providerId:"provider-uuid"});
  const [url,request]=transport.mock.calls[0];
  expect(url).toBe("https://api.resend.com/emails");
  expect(new Headers(request?.headers).get("Idempotency-Key")).toBe("gazaworks-email/fixed-id");
  expect(JSON.parse(request?.body as string)).toEqual({...envelope,to:[envelope.to]});
 });
 it.each([408,429,500,503])("retries transient provider response %s",async status=>{
  const transport=vi.fn<typeof fetch>().mockResolvedValue(new Response("",{status}));
  expect(await new ResendEmailProvider("test",transport).send(envelope,"fixed")).toEqual({status:"retry",code:`provider_http_${status}`});
 });
 it("does not mark invalid requests or malformed confirmations as sent",async()=>{
  const transport=vi.fn<typeof fetch>().mockResolvedValueOnce(new Response("private recipient error",{status:422})).mockResolvedValueOnce(new Response("{}",{status:200})).mockRejectedValueOnce(new Error("private key and email in error"));
  const provider=new ResendEmailProvider("test",transport);
  expect(await provider.send(envelope,"fixed")).toEqual({status:"failed",code:"provider_http_422"});
  expect(await provider.send(envelope,"fixed")).toEqual({status:"retry",code:"provider_invalid_response"});
  expect(await provider.send(envelope,"fixed")).toEqual({status:"retry",code:"provider_network_error"});
 });
});
describe("signed provider callbacks",()=>{
 // Independent vector published in Svix's manual verification documentation.
 const secret="whsec_plJ3nmyCDGBKInavdOK15jsl",timestamp=1731705121;
 const body='{"event_type":"ping","data":{"success":true}}';
 const headers=new Headers({"svix-id":"msg_loFOjxBNrRLzqYUf","svix-timestamp":String(timestamp),"svix-signature":"v1,rAvfW3dJ/X/qxhsaXPOyyCGmRKsaKWcsNccKXlIktD0="});
 it("accepts the independent Svix vector and key rotation signatures",()=>{
  expect(verifyEmailWebhook(body,headers,secret,timestamp)).toBe(true);
  const rotating=new Headers(headers);rotating.set("svix-signature",`v0,invalid v1,invalid ${headers.get("svix-signature")}`);
  expect(verifyEmailWebhook(body,rotating,secret,timestamp)).toBe(true);
 });
 it("rejects changed payload, wrong secret, expired and future timestamps",()=>{
  expect(verifyEmailWebhook(body+" ",headers,secret,timestamp)).toBe(false);
  expect(verifyEmailWebhook(body,headers,"whsec_aaaaaaaaaaaaaaaaaaaaaaaa",timestamp)).toBe(false);
  expect(verifyEmailWebhook(body,headers,secret,timestamp+301)).toBe(false);
  expect(verifyEmailWebhook(body,headers,secret,timestamp-301)).toBe(false);
  expect(verifyEmailWebhook(body,new Headers(),secret,timestamp)).toBe(false);
 });
 it("enforces a body size limit even when content-length is absent",async()=>{
  expect(await boundedWebhookBody(new Request("https://example.test",{method:"POST",body}))).toBe(body);
  await expect(boundedWebhookBody(new Request("https://example.test",{method:"POST",body:"x".repeat(65537)}))).rejects.toThrow("webhook_too_large");
 });
});
