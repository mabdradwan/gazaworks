import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("chat_participants").select("room_id,chat_rooms(id,project_id,created_at,projects(id,status,client_id,talent_id,client:profiles!projects_client_id_fkey(display_name,avatar_path),talent:profiles!projects_talent_id_fkey(display_name,avatar_path)))").eq("profile_id",user.id);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
