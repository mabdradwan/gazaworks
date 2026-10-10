import {describe,it,expect} from "vitest";
import {adminWorkflowError,hasCompletedInterview} from "@/domain/admin-workflow-error";

describe("verification eligibility and failure messages",()=>{
 it("requires both completed interview and recorded attendance",()=>{
  for(const value of [null,[],[{status:"completed",attendance:null}],[{status:"booked",attendance:"attended"}]])expect(hasCompletedInterview(value)).toBe(false);
  expect(hasCompletedInterview([{status:"cancelled"},{status:"completed",attendance:"attended"}])).toBe(true);
 });
 it("distinguishes interview prerequisites from missing permissions in every language",()=>{
  for(const locale of ["ar","en","tr","es","fr","de"]){
   const interview=adminWorkflowError(locale,"completed_interview_required",409);
   expect(interview).not.toBe(adminWorkflowError(locale,"forbidden",403));
   expect(interview).not.toContain("completed_interview_required");
   expect(adminWorkflowError(locale,"unauthorized",401)).not.toBe(adminWorkflowError(locale,"invalid_request",400));
  }
 });
});
