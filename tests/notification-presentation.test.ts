import {describe,expect,it} from "vitest";
import {notificationPresentation} from "@/lib/notification-copy";
const legacy={category:"security",title:"New sign-in detected",body:"A sign-in from a new browser or device was recorded on your GazaWorks account."};
describe("security notification localization",()=>{
 for(const locale of ["ar","tr","es","fr","de"]){
  it(`localizes existing security events in ${locale}`,()=>{
   const value=notificationPresentation(locale,legacy);
   expect(value.category).not.toBe("security");
   expect(value.title).not.toBe(legacy.title);
   expect(value.body).not.toBe(legacy.body);
  });
 }
 it("preserves other security notices",()=>{
  const notice={...legacy,body:"Different security notice"};
  expect(notificationPresentation("ar",notice).body).toBe(notice.body);
 });
 it("does not replace project content with a security template",()=>{
  const notice={...legacy,category:"projects"};
  expect(notificationPresentation("ar",notice).title).toBe(notice.title);
 });
 it("falls back to English for unsupported locales",()=>{
  expect(notificationPresentation("xx",legacy).category).toBe("Security");
 });
});
