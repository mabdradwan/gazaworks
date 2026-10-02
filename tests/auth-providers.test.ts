import {describe,expect,it} from "vitest";
import {googleProviderEnabled} from "../src/domain/auth-providers";
describe("available sign-in providers",()=>{
  it("enables Google only when the Auth service reports it enabled",()=>{
    expect(googleProviderEnabled({external:{google:true,email:true}})).toBe(true);
    expect(googleProviderEnabled({external:{google:false,email:true}})).toBe(false);
  });
  it.each([null,undefined,{},true,{external:null},{external:{google:"true"}},{external:{google:1}},{google:true}])("fails closed for malformed or unavailable provider settings",settings=>expect(googleProviderEnabled(settings)).toBe(false));
});
