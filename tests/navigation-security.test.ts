import {describe,expect,it} from "vitest";
import {safeReturnPath,localizedHref} from "../src/domain/navigation";
import {contentSecurityPolicy} from "../src/domain/content-security-policy";

describe("authentication navigation",()=>{
 it("keeps registration and the intended destination across locale changes",()=>{
  const url=new URL(localizedHref("/en/auth","mode=register&next=%2Fen%2Ftalent","ar"),"https://app.test");
  expect(url.pathname).toBe("/ar/auth");expect(url.searchParams.get("mode")).toBe("register");expect(url.searchParams.get("next")).toBe("/ar/talent");
 });
 it("keeps password recovery in update mode",()=>expect(localizedHref("/en/auth/reset","mode=update","fr")).toBe("/fr/auth/reset?mode=update"));
 it("preserves the selected administration module",()=>expect(localizedHref("/ar/admin","module=Email+templates","de")).toBe("/de/admin?module=Email+templates"));
 it("never copies callback secrets into language links or return destinations",()=>{
  const href=localizedHref("/en/auth","mode=register&code=private-code&access_token=private-token&next=%2Fen%2Ftalent%3Ftoken_hash%3Dprivate-hash","es");
  expect(href).not.toContain("private");expect(href).not.toContain("token");expect(href).not.toContain("code=");
 });
 it.each(["https://other.test/path","//other.test/path","/\\other.test","/en/talent/../../api/action","/auth/callback?code=abc","/en/talent\n","/en/talent#access_token=abc"])("rejects unsafe or non-application return path %s",path=>expect(safeReturnPath(path,"ar")).toBe("/ar/dashboard"));
 it("allows the verified recovery destination and normal project pages",()=>{
  expect(safeReturnPath("/fr/auth/reset?mode=update","fr")).toBe("/fr/auth/reset?mode=update");
  expect(safeReturnPath("/fr/dashboard/projects","fr")).toBe("/fr/dashboard/projects");
 });
});

describe("private media content security policy",()=>{
 const directives=(policy:string)=>Object.fromEntries(policy.split("; ").map(d=>{const [name,...values]=d.split(" ");return [name,values]}));
 it("permits signed media from only the configured storage origin and realtime endpoint",()=>{
  const policy=directives(contentSecurityPolicy({supabaseUrl:"https://example.supabase.co"}));
  expect(policy["img-src"]).toContain("https://example.supabase.co/storage/v1/");
  expect(policy["media-src"]).toContain("https://example.supabase.co/storage/v1/");
  expect(policy["connect-src"]).toEqual(["'self'","https://example.supabase.co","wss://example.supabase.co"]);
  expect(policy["script-src"]).not.toContain("'unsafe-eval'");
  expect(policy["object-src"]).toEqual(["'none'"]);
 });
 it.each(["https://user:secret@evil.test","https://evil.test/path","https://evil.test?key=value","https://evil.test/#x","http://remote.test","https://evil.test; img-src *"])("rejects malformed service origin %s",supabaseUrl=>{
  const policy=contentSecurityPolicy({supabaseUrl});
  expect(directives(policy)["connect-src"]).toEqual(["'self'"]);
  expect(policy).not.toContain("evil.test");expect(policy).not.toContain("secret");
 });
 it("supports local Supabase only in development",()=>{
  const supabaseUrl="http://127.0.0.1:54321";
  expect(directives(contentSecurityPolicy({supabaseUrl,development:true}))["connect-src"]).toContain("ws://127.0.0.1:54321");
  expect(directives(contentSecurityPolicy({supabaseUrl}))["connect-src"]).toEqual(["'self'"]);
 });
});
