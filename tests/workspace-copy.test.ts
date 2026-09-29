import {describe,expect,it} from "vitest";
import {workspaceCopy} from "../src/lib/workspace-copy";
import {dashboardPageCopy,type DashboardPageKey} from "../src/lib/dashboard-page-copy";
import {basicWorkspaceCopy} from "../src/lib/basic-workspace-copy";
import {directHireCopy} from "../src/lib/direct-hire-copy";
import {locales,messages} from "../src/lib/i18n";
import {uiCopy} from "../src/lib/ui-copy";
import {workspaceFormCopy} from "../src/lib/workspace-form-copy";
import {financeReviewCopy} from "../src/lib/finance-review-copy";
import {messagesPanelCopy} from "../src/lib/messages-panel-copy";
import {projectPanelCopy} from "../src/lib/project-panel-copy";

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
 it.each(locales)("provides the complete overview copy in %s",locale=>{
  const c=uiCopy(locale).workspace;
  for(const text of [c.professionalWorkspace,c.welcome,c.welcomeBody,c.editProfile,c.completeProfile,c.projects,c.unreadNotifications,c.conversations,c.workRequests,c.portfolio,c.open,c.accountStatus,c.profile,c.verification,c.accountType,c.recommended,c.clientNext,c.findTalent,c.postWorkRequest,c.verifiedNext,c.continueVerification,c.profileNext,c.completeProfessionalProfile,c.notApplicable])expect(text.length).toBeGreaterThan(1);
  for(const text of Object.values(c.status))expect(text.length).toBeGreaterThan(1);
 });
});

describe("direct-hire translations",()=>{
 it.each(locales)("provides actions and states in %s",locale=>{
  const c=directHireCopy(locale);
  for(const text of [c.accepted,c.declined,c.withdrawn,c.failed,c.client,c.talent,c.delivery,c.workRequest,c.accept,c.decline,c.withdraw,c.empty,...Object.values(c.statuses)])expect(text.length).toBeGreaterThan(1);
 });
 it("falls back safely for an unsupported locale",()=>expect(directHireCopy("unknown").empty).toBe("No direct work requests yet."));
});

describe("basic workspace component translations",()=>{
 it.each(locales)("provides favorites, security and avatar copy in %s",locale=>{
  const c=basicWorkspaceCopy(locale);
  expect(c.language).toBe(locale);
  for(const text of Object.values(c.favorites))expect(text.length).toBeGreaterThan(1);
  for(const text of Object.values(c.security))expect(text.length).toBeGreaterThan(1);
  for(const text of Object.values(c.avatar))expect(text.length).toBeGreaterThan(1);
 });
 it("falls back safely for an unsupported locale",()=>expect(basicWorkspaceCopy("unknown").favorites.view).toBe("View profile"));
});

describe("workspace page translations",()=>{
 const pages:DashboardPageKey[]=["directHire","disputes","favorites","messages","notifications","offers","portfolio","profile","projects","reviews","security","team","workRequests"];
 it.each(locales)("provides every page heading and description in %s",locale=>{
  for(const page of pages){
   const c=dashboardPageCopy(locale,page);
   expect(c.title.length).toBeGreaterThan(1);
   expect(c.description.length).toBeGreaterThan(10);
  }
  for(const page of ["profile","team","workRequests"] as const)expect(dashboardPageCopy(locale,page).badge?.length).toBeGreaterThan(1);
 });
 it("falls back safely for an unsupported locale",()=>expect(dashboardPageCopy("unknown","projects").title).toBe("Projects"));
});

describe("workspace form translations",()=>{
 it.each(locales)("provides team member and work request copy in %s",locale=>{
  const c=workspaceFormCopy(locale);
  expect(c.language).toBe(locale);
  for(const [key,value] of Object.entries(c.teamMembers)){
   if(key!=="privacyModes")expect(String(value).length).toBeGreaterThan(1);
  }
  for(const text of Object.values(c.teamMembers.privacyModes))expect(text.length).toBeGreaterThan(1);
  for(const [key,value] of Object.entries(c.workRequests)){
   if(key!=="statuses"&&key!=="visibilityModes")expect(String(value).length).toBeGreaterThan(1);
  }
  for(const text of [...Object.values(c.workRequests.statuses),...Object.values(c.workRequests.visibilityModes)])expect(text.length).toBeGreaterThan(1);
 });
 it("falls back safely for an unsupported locale",()=>expect(workspaceFormCopy("unknown").workRequests.publish).toBe("Publish work request"));
});

describe("finance and review translations",()=>{
 it.each(locales)("provides ledger and review copy in %s",locale=>{
  const c=financeReviewCopy(locale);
  expect(c.language).toBe(locale);
  for(const [key,value] of Object.entries(c.finance)){
   if(key!=="states"&&key!=="providers")expect(String(value).length).toBeGreaterThan(1);
  }
  for(const text of [...Object.values(c.finance.states),...Object.values(c.finance.providers),...Object.values(c.reviews)])expect(text.length).toBeGreaterThan(1);
 });
 it("falls back safely for an unsupported locale",()=>expect(financeReviewCopy("unknown").finance.title).toBe("Transaction ledger"));
});

describe("message panel translations",()=>{
 it.each(locales)("provides moderation and chat labels in %s",locale=>{
  const c=messagesPanelCopy(locale);
  expect(c.language).toBe(locale);
  for(const [key,value] of Object.entries(c)){
   if(key!=="projectStates")expect(String(value).length).toBeGreaterThan(1);
  }
  for(const text of Object.values(c.projectStates))expect(text.length).toBeGreaterThan(1);
 });
 it("never shows the server's English moderation notice in Arabic",()=>{
  const c=messagesPanelCopy("ar");
  expect(c.pendingReview).toContain("24 ساعة");
  expect(c.pendingReview).not.toContain("awaiting review");
 });
});

describe("payment availability in public copy",()=>{
 it.each(locales)("does not promise secured payments in %s",locale=>{
  const c=messages(locale);
  const publicCopy=[c.hero.body,...c.stats].join(" ").toLowerCase();
  expect(publicCopy).not.toMatch(/pago asegurado|paiements protégés|paiement sécurisé|geschützte zahlungen|gesicherter? zahlung/);
 });
});

describe("project workflow translations",()=>{
 it.each(locales)("provides project actions and explicit simulator warnings in %s",locale=>{
  const c=projectPanelCopy(locale);
  expect(c.language).toBe(locale);
  for(const [key,value] of Object.entries(c)){
   if(key!=="language"&&key!=="localeTag")expect(String(value).length).toBeGreaterThan(1);
  }
  expect(c.simulationWarning).not.toBe(c.paymentSecured);
 });
 it("falls back safely for unsupported locale",()=>expect(projectPanelCopy("constructor").empty).toBe("No projects yet."));
});
