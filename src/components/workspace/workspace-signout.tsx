"use client";
import {useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

export function WorkspaceSignOut({locale}:{locale:string}){
  const [busy,setBusy]=useState(false);
  async function signOut(){
    setBusy(true);
    await supabaseBrowser().auth.signOut();
    window.location.assign(`/${locale}`);
  }
  return <button className="workspace-signout" onClick={()=>void signOut()} disabled={busy}>{busy?"Signing out…":"Sign out"}</button>
}
