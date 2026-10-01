import {NextResponse,type NextRequest} from "next/server";
import {locales} from "@/lib/i18n";
import {mutationOriginAllowed} from "@/domain/request-origin";

export function middleware(req:NextRequest){
  const {pathname}=req.nextUrl;
  if(pathname.startsWith("/api")){
    if(!mutationOriginAllowed({method:req.method,path:pathname,origin:req.headers.get("origin"),host:req.nextUrl.host,fetchSite:req.headers.get("sec-fetch-site")})){
      return NextResponse.json({error:"forbidden_origin"},{status:403});
    }
    return NextResponse.next();
  }
  // Email confirmation, recovery and OAuth share this non-localized route.
  // Prefixing it with a language prevents its route handler from receiving the code.
  if(pathname==="/auth/callback")return NextResponse.next();
  if(pathname.includes("."))return NextResponse.next();
  const first=pathname.split("/")[1];
  if(!locales.includes(first as never)){
    const url=req.nextUrl.clone();
    url.pathname=`/en${pathname}`;
    return NextResponse.redirect(url);
  }
  const res=NextResponse.next();
  res.headers.set("x-request-id",crypto.randomUUID());
  return res;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
