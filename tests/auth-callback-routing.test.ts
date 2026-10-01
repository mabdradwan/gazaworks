import {describe,expect,it} from "vitest";
import {NextRequest} from "next/server";
import {middleware} from "../src/middleware";
import {recoveryCallback} from "../src/domain/password-recovery";

describe("authentication callback routing",()=>{
  for(const locale of ["ar","en","tr","es","fr","de"]){
    it(`lets the ${locale} recovery callback reach its route handler`,()=>{
      const callback=new URL(recoveryCallback("https://app.test",locale));
      callback.searchParams.set("code","synthetic-test-code");
      const request=new NextRequest(callback);
      const response=middleware(request);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(request.nextUrl.pathname).toBe("/auth/callback");
      expect(request.nextUrl.searchParams.get("next")).toBe(`/${locale}/auth/reset?mode=update`);
    });
  }
  it("does not localize an OAuth callback",()=>{
    const response=middleware(new NextRequest("https://app.test/auth/callback?code=synthetic-oauth-code&accountType=team"));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
  it("still localizes ordinary unprefixed pages",()=>{
    const response=middleware(new NextRequest("https://app.test/about?q=work"));
    expect(response.headers.get("location")).toBe("https://app.test/en/about?q=work");
  });
  it("keeps localized recovery pages accessible",()=>{
    const response=middleware(new NextRequest("https://app.test/ar/auth/reset?mode=update"));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });
  it("does not exempt unrelated auth routes",()=>{
    const response=middleware(new NextRequest("https://app.test/auth/callback-other"));
    expect(response.headers.get("location")).toBe("https://app.test/en/auth/callback-other");
  });
  it("continues rejecting cross-origin API mutations",()=>{
    const response=middleware(new NextRequest("https://app.test/api/security/session",{
      method:"POST",headers:{origin:"https://attacker.test","sec-fetch-site":"cross-site"}
    }));
    expect(response.status).toBe(403);
    expect(response.headers.get("x-middleware-next")).toBeNull();
  });
});
