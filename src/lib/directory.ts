import "server-only";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
export async function directoryAccess(){
 const session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
 if(!user)return null;
 const {data:p}=await session.from("profiles").select("account_type,account_status").eq("id",user.id).single();
 if(!p||p.account_status!=="active")return null;
 if(p.account_type!=="client"){
  const {data:allowed}=await session.rpc("has_permission",{required:"users.read"});
  if(!allowed)return null;
 }
 return supabaseAdmin();
}
