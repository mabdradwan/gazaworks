import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

type ModuleConfig={permission:string;table:string;select:string;order?:string;ascending?:boolean;limit?:number;filters?:Record<string,string>};
const modules:Record<string,ModuleConfig>={
  "Work Requests":{permission:"projects.read",table:"work_requests",select:"id,client_id,title,description,category_id,budget_min_minor,budget_max_minor,currency,visibility,status,delivery_expectations,notes,created_at,profiles!work_requests_client_id_fkey(display_name),work_request_skills(skill_id)"},
  "Offers":{permission:"offers.read",table:"offers",select:"id,work_request_id,talent_id,price_minor,currency,delivery_days,proposal,scope,status,created_at,profiles!offers_talent_id_fkey(display_name),work_requests(title,client_id)"},
  "Projects":{permission:"projects.read",table:"projects",select:"id,work_request_id,client_id,talent_id,accepted_offer_id,status,deadline,created_at,client:profiles!projects_client_id_fkey(display_name),talent:profiles!projects_talent_id_fkey(display_name),project_agreements(scope,price_minor,currency,accepted_at)"},
  "Messages":{permission:"messages.review",table:"chat_rooms",select:"id,project_id,created_at,projects(status,client_id,talent_id),chat_participants(profile_id),chat_messages(id,sender_id,body,message_type,status,created_at)"},
  "Transactions":{permission:"payments.read",table:"transactions",select:"id,project_id,client_id,talent_id,gross_minor,platform_deduction_minor,provider_fee_minor,platform_revenue_minor,worker_entitlement_minor,currency,provider,provider_reference,dispute_state,created_at,payments(status,simulated,created_at),payouts(status,amount_minor,payout_date)"},
  "Payments":{permission:"payments.read",table:"payments",select:"id,transaction_id,status,amount_minor,provider_event_id,simulated,created_at,transactions(project_id,currency,client_id,talent_id,provider)"},
  "Reviews":{permission:"users.read",table:"reviews",select:"id,project_id,author_id,subject_id,communication,professionalism,overall,quality,delivery,clarity,cooperation,feedback,moderation_status,author:profiles!reviews_author_id_fkey(display_name),subject:profiles!reviews_subject_id_fkey(display_name)"},
  "Notifications":{permission:"notifications.manage",table:"admin_notifications",select:"id,category,title,body,entity_type,entity_id,priority,assigned_to,resolution_status,resolved_by,resolved_at,data,created_at"},
  "Media":{permission:"content.edit",table:"media",select:"id,storage_path,mime_type,size_bytes,alt_translations,uploaded_by,created_at"},
  "Categories":{permission:"content.edit",table:"categories",select:"id,slug,parent_id,active,category_translations(locale,name)"},
  "Skills":{permission:"content.edit",table:"skills",select:"id,slug,active,skill_translations(locale,name)"},
  "Email Templates":{permission:"email.manage",table:"email_templates",select:"key,locale,subject,body_html,body_text,enabled,updated_at"},
  "Security Logs":{permission:"security.read",table:"security_logs",select:"id,profile_id,event,risk,ip_hash,user_agent,metadata,created_at"},
  "Audit Logs":{permission:"audit.read",table:"audit_logs",select:"id,actor_id,action,entity_type,entity_id,old_data,new_data,ip_hash,created_at"},
  "System Settings":{permission:"settings.manage",table:"settings",select:"key,value,public,updated_at"},
  "AI Settings":{permission:"settings.manage",table:"settings",select:"key,value,public,updated_at",filters:{key:"ai_config"}},
  "Payment Settings":{permission:"settings.manage",table:"settings",select:"key,value,public,updated_at"}
};

export async function GET(req:NextRequest){
  const module=req.nextUrl.searchParams.get("module")??"",cfg=modules[module];
  if(!cfg)return NextResponse.json({error:"unsupported_module"},{status:404});
  const auth=await requirePermission(cfg.permission);if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  let q=supabaseAdmin().from(cfg.table).select(cfg.select);
  if(module==="Payment Settings")q=q.in("key",["commission","payment_methods"]);
  for(const [k,v] of Object.entries(cfg.filters??{}))q=q.eq(k,v);
  if(cfg.order)q=q.order(cfg.order,{ascending:cfg.ascending??false});
  else if(!["Categories","Skills","Email Templates","System Settings","AI Settings","Payment Settings"].includes(module))q=q.order("created_at",{ascending:false});
  const {data,error}=await q.limit(cfg.limit??300);
  return error?NextResponse.json({error:"load_failed",detail:error.message},{status:400}):NextResponse.json(data??[]);
}

export async function PATCH(req:NextRequest){
  try{
    const input=z.discriminatedUnion("action",[
      z.object({action:z.literal("review_moderation"),id:z.string().uuid(),status:z.enum(["published","hidden","removed"])}),
      z.object({action:z.literal("notification"),id:z.string().uuid(),resolutionStatus:z.enum(["open","assigned","resolved","dismissed"]),assignedTo:z.string().uuid().nullable().optional()}),
      z.object({action:z.literal("setting"),key:z.string().min(2).max(120),value:z.unknown(),isPublic:z.boolean().optional()}),
      z.object({action:z.literal("taxonomy_active"),kind:z.enum(["category","skill"]),id:z.string().uuid(),active:z.boolean()})
    ]).parse(await req.json());
    if(input.action==="review_moderation"){
      const auth=await requirePermission("users.edit");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
      const {error}=await supabaseAdmin().from("reviews").update({moderation_status:input.status}).eq("id",input.id);
      return NextResponse.json({ok:!error},{status:error?400:200});
    }
    if(input.action==="notification"){
      const auth=await requirePermission("notifications.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
      const patch={resolution_status:input.resolutionStatus,assigned_to:input.assignedTo??(input.resolutionStatus==="assigned"?auth.user.id:null),...(input.resolutionStatus==="resolved"?{resolved_by:auth.user.id,resolved_at:new Date().toISOString()}:{})};
      const {error}=await supabaseAdmin().from("admin_notifications").update(patch).eq("id",input.id);
      return NextResponse.json({ok:!error},{status:error?400:200});
    }
    if(input.action==="setting"){
      const auth=await requirePermission("settings.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
      const {error}=await supabaseAdmin().from("settings").upsert({key:input.key,value:input.value,public:input.isPublic??false,updated_by:auth.user.id,updated_at:new Date().toISOString()});
      return NextResponse.json({ok:!error},{status:error?400:200});
    }
    const auth=await requirePermission("taxonomy.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
    const table=input.kind==="category"?"categories":"skills";
    const {error}=await supabaseAdmin().from(table).update({active:input.active}).eq("id",input.id);
    return NextResponse.json({ok:!error},{status:error?400:200});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
