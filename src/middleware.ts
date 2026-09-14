import {NextResponse,type NextRequest} from "next/server"; import {locales} from "@/lib/i18n";
export function middleware(req:NextRequest){const {pathname}=req.nextUrl;if(pathname.startsWith("/api")||pathname.includes("."))return NextResponse.next();const first=pathname.split("/")[1];if(!locales.includes(first as never)){const url=req.nextUrl.clone();url.pathname=`/en${pathname}`;return NextResponse.redirect(url)}const res=NextResponse.next();res.headers.set("x-request-id",crypto.randomUUID());return res}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
