import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export function GET(){
  return NextResponse.json(
    {app:"GazaWorks",commit:process.env.VERCEL_GIT_COMMIT_SHA??null,branch:process.env.VERCEL_GIT_COMMIT_REF??null,environment:process.env.VERCEL_ENV??"local"},
    {headers:{"Cache-Control":"no-store, max-age=0"}}
  );
}
