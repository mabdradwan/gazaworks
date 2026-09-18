"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
export function WorkspaceLink({href,children}:{href:string;children:React.ReactNode}){
 const pathname=usePathname()?.replace(/\/$/,"");
 return <Link href={href} aria-current={pathname===href.replace(/\/$/,"")?"page":undefined}>{children}</Link>;
}
