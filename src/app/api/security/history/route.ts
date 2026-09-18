import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(){
  const db=await supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("login_history")
    .select("id,provider,success,user_agent,device_hash,metadata,created_at")
    .eq("profile_id",user.id)
    .order("created_at",{ascending:false})
    .limit(50);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
