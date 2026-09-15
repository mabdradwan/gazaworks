import {NextRequest,NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
import {recordLoginEvent,requestNetworkMetadata} from "@/lib/security-events";

export async function POST(req:NextRequest){
  const db=await supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
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
