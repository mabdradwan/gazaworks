// Creates only fictional development data. No emails, payments, or payouts are sent.
import {createClient} from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,password=process.env.DEMO_PASSWORD;
if(process.env.ALLOW_DEMO_SEED!=="true"||process.env.NODE_ENV==="production"||process.env.VERCEL_ENV==="production")throw new Error("Development seed is disabled. Set ALLOW_DEMO_SEED=true only for a disposable development project.");
if(!url||!key||!password||password.length<16)throw new Error("Set Supabase URL, server-only service key, and a DEMO_PASSWORD of at least 16 characters.");
const host=new URL(url).hostname;
if(!["localhost","127.0.0.1","::1","[::1]"].includes(host)&&host!==`${process.env.DEMO_PROJECT_REF}.supabase.co`)throw new Error("Remote seeds require DEMO_PROJECT_REF matching the isolated development project.");
if(host==="cvkpardnzwkfgmlmjccm.supabase.co")throw new Error("The connected live GazaWorks project is excluded from demo seeding.");
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const fixtures=[
 {name:"individual",kind:"individual"},
 {name:"verified-individual",kind:"individual",verified:true},
 {name:"team",kind:"team"},
 {name:"verified-team",kind:"team",verified:true},
 {name:"client",kind:"client"},
 {name:"super-admin",kind:"client",role:"Super Admin"},
 {name:"moderator",kind:"client",role:"Moderator"},
 {name:"verification-officer",kind:"client",role:"Verification Officer"}
];
async function checked(request){const {data,error}=await request;if(error)throw error;return data}
const existing=[];
for(let page=1;;page++){const {data,error}=await db.auth.admin.listUsers({page,perPage:1000});if(error)throw error;existing.push(...data.users);if(data.users.length<1000)break}
const ids={};
for(const fixture of fixtures){
 const email=`${fixture.name}@gazaworks.test.invalid`;
 let user=existing.find(u=>u.email===email);
 if(!user){const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{account_type:fixture.kind,display_name:`Demo ${fixture.name}`,locale:"en"}});if(error)throw error;user=data.user}
 if(!user)throw new Error("Seed user was not created");
 ids[fixture.name]=user.id;
 await checked(db.rpc("gw_provision_profile",{actor:user.id,kind:fixture.kind,display_name:`Demo ${fixture.name}`,locale:"en",email}));
 if(fixture.kind==="individual")await checked(db.from("individual_profiles").update({professional_title:"Demo product designer",bio:"Fictional development profile for workflow testing only.",gaza_location:"Gaza — synthetic fixture",availability:"Available now",years_experience:3,verification_status:fixture.verified?"verified":"draft"}).eq("profile_id",user.id));
 if(fixture.kind==="team")await checked(db.from("team_profiles").update({description:"Fictional development team for workflow testing only.",gaza_location:"Gaza — synthetic fixture",team_size:3,verification_status:fixture.verified?"verified":"draft"}).eq("profile_id",user.id));
 if(fixture.kind==="client")await checked(db.from("client_profiles").update({country_code:"TR",company_name:"Demo organization — not real"}).eq("profile_id",user.id));
 await checked(db.from("profiles").update({onboarding_complete:true}).eq("id",user.id));
 if(fixture.role){const role=await checked(db.from("roles").select("id").eq("name",fixture.role).single());await checked(db.from("admin_roles").upsert({profile_id:user.id,role_id:role.id,assigned_by:user.id}))}
 console.log(`Ready: ${email} (${fixture.role??fixture.kind})`);
}
const category=await checked(db.from("categories").select("id").eq("slug","design").single());
const title="DEMO — fictional website design project";
let request=await checked(db.from("work_requests").select("id,status").eq("client_id",ids.client).eq("title",title).maybeSingle());
if(!request){const result=await checked(db.rpc("gw_create_work_request",{actor:ids.client,input:{title,description:"Fictional test project: design three responsive website screens. No real work or payment is requested.",categoryId:category.id,skills:[],budgetMin:100000,budgetMax:100000,currency:"USD",visibility:"public"}}));request={id:result.id,status:"published"}}
if(request.status==="published"){
 const old=await checked(db.from("offers").select("id,talent_id").eq("work_request_id",request.id));
 let accepted=old.find(o=>o.talent_id===ids["verified-individual"]);
 for(const name of ["verified-individual","verified-team"]){if(old.some(o=>o.talent_id===ids[name]))continue;const offer=await checked(db.from("offers").insert({work_request_id:request.id,talent_id:ids[name],price_minor:100000,currency:"USD",delivery_days:7,proposal:"Development demonstration only. No actual work offered.",scope:"Three fictional responsive screen designs"}).select("id,talent_id").single());if(name==="verified-individual")accepted=offer}
 await checked(db.rpc("gw_accept_offer",{actor:ids.client,offer_id:accepted.id}));
}
console.log("Development fixtures are ready. The example project awaits simulated funding. No money was moved.");
