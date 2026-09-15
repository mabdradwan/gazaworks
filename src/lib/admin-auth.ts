import "server-only";
import {supabaseServer} from "@/lib/supabase/server";

export async function requirePermission(permission:string){
  const db=await supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  if(!user)return {ok:false as const,status:401,db,user:null};
  const {data}=await db.rpc("has_permission",{required:permission});
  if(!data)return {ok:false as const,status:403,db,user};
  return {ok:true as const,status:200,db,user};
}
