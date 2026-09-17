"use client";
import {useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";
const copy:Record<string,readonly[string,string,string]>={
 ar:["تسجيل الخروج","جارٍ تسجيل الخروج…","تعذّر تسجيل الخروج. حاول مرة أخرى."],
 en:["Sign out","Signing out…","Could not sign out. Please try again."],
 tr:["Çıkış yap","Çıkış yapılıyor…","Çıkış yapılamadı. Lütfen tekrar deneyin."],
 es:["Cerrar sesión","Cerrando sesión…","No se pudo cerrar sesión. Inténtalo de nuevo."],
 fr:["Se déconnecter","Déconnexion…","Impossible de se déconnecter. Réessayez."],
 de:["Abmelden","Abmeldung…","Abmeldung fehlgeschlagen. Bitte erneut versuchen."]
};
export function WorkspaceSignOut({locale}:{locale:string}){
 const c=copy[locale]??copy.en;
 const [busy,setBusy]=useState(false),[error,setError]=useState(false);
 async function signOut(){
  setBusy(true);setError(false);
  try{const result=await supabaseBrowser().auth.signOut();if(result.error)throw result.error;window.location.assign(`/${locale}`)}
  catch{setError(true);setBusy(false)}
 }
 return <><button className="workspace-signout" onClick={()=>void signOut()} disabled={busy} aria-busy={busy}>{busy?c[1]:c[0]}</button>{error&&<p className="error" role="alert">{c[2]}</p>}</>;
}
