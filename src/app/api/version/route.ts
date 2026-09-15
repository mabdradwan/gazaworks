import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export function GET(){
  return NextResponse.json(
    {app:"GazaWorks",release:"workspace-v2",build:"2026-09-15",workspace:true},
    {headers:{"Cache-Control":"no-store, max-age=0"}}
  );
}
