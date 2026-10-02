import {describe,expect,it} from "vitest";
import {mutationOriginAllowed} from "@/domain/request-origin";
const request={method:"POST",path:"/api/profile",host:"gazaworks.netlify.app",origin:"https://gazaworks.netlify.app",fetchSite:"same-origin"};
describe("browser API mutation origin",()=>{
 it("accepts the current origin and read-only routes",()=>{
  expect(mutationOriginAllowed(request)).toBe(true);
  expect(mutationOriginAllowed({...request,method:"GET",origin:"https://untrusted.test"})).toBe(true);
 });
 it("rejects foreign origins, including same-site or forwarded forms",()=>{
  expect(mutationOriginAllowed({...request,origin:"https://evil.test"})).toBe(false);
  expect(mutationOriginAllowed({...request,origin:"https://evil-gazaworks.netlify.app"})).toBe(false);
  expect(mutationOriginAllowed({...request,origin:null,fetchSite:"cross-site"})).toBe(false);
  expect(mutationOriginAllowed({...request,origin:"not a url"})).toBe(false);
 });
 it("allows protected machine callbacks without browser origin",()=>{
  expect(mutationOriginAllowed({...request,path:"/api/cron/email-outbox",origin:null,fetchSite:null})).toBe(true);
  expect(mutationOriginAllowed({...request,path:"/api/webhooks/email",origin:null,fetchSite:null})).toBe(true);
 });
});
