import {NextResponse,type NextRequest} from "next/server";
import {locales} from "@/lib/i18n";
export function middleware(req:NextRequest){
 const {pathname}=req.nextUrl;
 if(pathname.startsWith("/api")){
  if(!["GET","HEAD","OPTIONS"].includes(req.method)){
   const origin=req.headers.get("origin"),site=req.headers.get("sec-fetch-site");
   if(site==="cross-site"||(origin&&origin!==req.nextUrl.origin))return NextResponse.json({error:"invalid_origin"},{status:403});
  }
  const response=NextResponse.next();response.headers.set("Cache-Control","private, no-store");return response;
 }
 if(pathname==="/auth/callback"||pathname.includes("."))return NextResponse.next();
 const first=pathname.split("/")[1];
 if(!locales.includes(first as never)){const url=req.nextUrl.clone();url.pathname=`/en${pathname}`;return NextResponse.redirect(url);}
 const res=NextResponse.next();res.headers.set("x-request-id",crypto.randomUUID());
 if(/\/(dashboard|admin|talent)(\/|$)/.test(pathname))res.headers.set("X-Robots-Tag","noindex, nofollow");
 return res;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
