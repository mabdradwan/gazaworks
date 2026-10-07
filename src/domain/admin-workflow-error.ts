import {adminRecordLabel} from "@/lib/admin-record-copy";
import {adminEditorCopy} from "@/lib/admin-editor-copy";

export function adminWorkflowError(locale:string,error:unknown,status:number){
  if(error==="completed_interview_required")return adminRecordLabel(locale,"interviewRequiredHint");
  if(error==="verification_not_allowed")return adminRecordLabel(locale,"verificationNotAllowed");
  if(status===401)return adminRecordLabel(locale,"sessionExpired");
  if(status===403)return adminRecordLabel(locale,"permissionDenied");
  if(status===400||error==="invalid_request")return adminRecordLabel(locale,"invalidFields");
  return adminEditorCopy(locale).saveError;
}

export function hasCompletedInterview(appointments:unknown){
  return Array.isArray(appointments)&&appointments.some(value=>value&&typeof value==="object"&&value.status==="completed"&&value.attendance==="attended");
}
