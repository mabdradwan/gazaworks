import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("projects").select("id,status,deadline,created_at,client_id,talent_id,work_request_id,project_agreements(scope,price_minor,currency),profiles!projects_client_id_fkey(display_name),talent:profiles!projects_talent_id_fkey(display_name)").order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
