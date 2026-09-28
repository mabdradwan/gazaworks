import {z} from "zod";

export const appointmentStatuses=["available","booked","blocked","cancelled","completed","no_show"] as const;
export type AppointmentStatus=(typeof appointmentStatuses)[number];
export type Attendance="pending"|"attended"|"absent";
export type Appointment={id:string;starts_at:string;ends_at:string;status:AppointmentStatus;user_notes:string|null;version:number;attendance:Attendance};
export type StaffMember={id:string;display_name:string};
export type AdminAppointment=Appointment & {employee_id:string|null;request_id:string|null;internal_notes:string|null;applicant_name:string|null};
export const appointmentCreateSchema=z.object({
  startsAt:z.string().datetime(),endsAt:z.string().datetime(),employeeId:z.string().uuid().nullable().default(null),
  userNotes:z.string().max(2000).default(""),internalNotes:z.string().max(5000).default(""),status:z.enum(["available","blocked"]).default("available")
}).strict();
export const appointmentActionSchema=z.object({
  id:z.string().uuid(),version:z.number().int().positive(),
  action:z.enum(["reschedule","assign","notes","block","open","cancel","attend","complete","no_show"]),
  startsAt:z.string().datetime().optional(),endsAt:z.string().datetime().optional(),
  employeeId:z.string().uuid().nullable().optional(),userNotes:z.string().max(2000).optional(),internalNotes:z.string().max(5000).optional()
}).strict().superRefine((input,ctx)=>{
  if(input.action==="reschedule"&&(!input.startsAt||!input.endsAt))ctx.addIssue({code:"custom",message:"Time range required"});
  if(input.action==="assign"&&input.employeeId===undefined)ctx.addIssue({code:"custom",message:"Staff selection required"});
});

// datetime-local uses the administrator's time zone; the API receives UTC.
export function localDateTime(value:string){
  const date=new Date(value);
  return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
}
