import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";

export async function refreshSession(request:NextRequest){
 let response=NextResponse.next({request});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key||!request.cookies.getAll().some(c=>c.name.startsWith("sb-")))return response;
 const db=createServerClient(url,key,{cookies:{
  getAll:()=>request.cookies.getAll(),
  setAll(cookies){
   cookies.forEach(({name,value})=>request.cookies.set(name,value));
   response=NextResponse.next({request});
   cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options));
  }
 }});
 // Validate with Auth and carry refreshed cookies to both RSC and the browser.
 await db.auth.getUser();
 response.headers.set("Cache-Control","private, no-store");
 return response;
}
