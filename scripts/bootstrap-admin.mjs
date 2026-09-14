import {createClient} from "@supabase/supabase-js";

const email=process.argv[2];
if(!email){console.error("Usage: node scripts/bootstrap-admin.mjs admin@example.com");process.exit(1)}
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");process.exit(1)}
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
let page=1,user=null;
while(!user){
  const {data,error}=await db.auth.admin.listUsers({page,perPage:1000});
  if(error)throw error;
  user=data.users.find(u=>u.email?.toLowerCase()===email.toLowerCase())??null;
  if(user||data.users.length<1000)break;
  page++;
}
if(!user)throw new Error("Auth user not found. Register the administrator account first.");
const {data:role,error:roleError}=await db.from("roles").select("id").eq("name","Super Admin").single();
if(roleError||!role)throw roleError??new Error("Super Admin role missing");
const {error}=await db.from("admin_roles").upsert({profile_id:user.id,role_id:role.id,assigned_by:user.id});
if(error)throw error;
console.log("Super Admin role assigned to",email);
