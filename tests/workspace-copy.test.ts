import {describe,expect,it} from "vitest";
import {workspaceCopy} from "../src/lib/workspace-copy";
import {locales} from "../src/lib/i18n";

describe("workspace translations",()=>{
 it.each(locales)("provides account and navigation labels in %s",locale=>{
  const c=workspaceCopy(locale);
  for(const text of [c.individual,c.team,c.client,c.ready,c.incomplete,c.menu])expect(text.length).toBeGreaterThan(0);
  for(const key of ["Overview","Profile","Portfolio","Verification","Appointments","Direct Hire","Offers","Projects","Messages","Payments","Disputes","Reviews","AI CV Builder","Notifications","Find Talent","Saved Talent","Work Requests","Security"]){
   expect(c.label(key)?.length).toBeGreaterThan(0);
  }
 });
 it("falls back safely for an unsupported locale",()=>expect(workspaceCopy("unknown").menu).toBe("Workspace menu"));
 it("does not treat inherited object names as locales",()=>expect(workspaceCopy("constructor").label("Security")).toBe("Security"));
});
