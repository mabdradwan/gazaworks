import {NextRequest,NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
import {recordLoginEvent,requestNetworkMetadata} from "@/lib/security-events";

export async function POST(req:NextRequest){
  const db=await supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data:profile,error}=await db.from("profiles").select("account_type,account_status").eq("id",user.id).maybeSingle();
  if(error)return NextResponse.json({error:"profile_provisioning"},{status:503});
  if(!profile)return NextResponse.json({error:"account_type_required"},{status:409});
  if(profile.account_status!=="active"){
    await db.auth.signOut({scope:"local"});
    return NextResponse.json({error:"account_unavailable"},{status:403});
  }
  const {ip,userAgent}=requestNetworkMetadata(req.headers);
  await recordLoginEvent({
    profileId:user.id,
    provider:String(user.app_metadata?.provider??"password"),
    ip,
    userAgent,
    metadata:{source:"session"}
  });
  return NextResponse.json({ok:true});
}
