'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {Menu,X} from 'lucide-react';
import {WorkspaceLink} from './workspace-link';
import {WorkspaceSignOut} from './workspace-signout';
import {LocaleSwitcher} from '@/components/locale-switcher';
import {workspaceCopy} from '@/lib/workspace-copy';
import {messages,type Locale} from '@/lib/i18n';
import {marketingCopy} from '@/lib/marketing-copy';
export function UnifiedMenu({locale,accountType,enabledLocales}:{locale:Locale;accountType:string;enabledLocales?:Locale[]}){
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),path=usePathname(),c=workspaceCopy(locale),t=messages(locale);
 useEffect(()=>{dialog.current?.close()},[path]);
 const links=[['Projects','projects'],['Overview','overview'],['Profile','profile'],...(accountType==='client'?[['Saved Talent','favorites'],['Work Requests','work-requests']]:[['Portfolio','portfolio'],...(accountType==='individual'?[['AI CV Builder','cv-builder']]:[])])];
 return <><button type="button" className="btn secondary" aria-label={c.menu} onClick={()=>dialog.current?.showModal()} ref={trigger}><Menu size={23}/></button><dialog className="unified-menu" ref={dialog} onClose={()=>trigger.current?.focus()} onClick={e=>{if(e.target===dialog.current)dialog.current.close()}}>
  <div className="unified-menu-heading"><strong>{c.menu}</strong><button type="button" className="ai-icon-button" aria-label={{ar:'إغلاق',en:'Close',tr:'Kapat',es:'Cerrar',fr:'Fermer',de:'Schließen'}[locale]} onClick={()=>dialog.current?.close()}><X/></button></div>
  <nav className="workspace-nav" aria-label={c.menu} onClick={e=>{if((e.target as HTMLElement).closest('a'))dialog.current?.close()}}>{links.map(([label,slug])=><WorkspaceLink key={slug} href={`/${locale}/dashboard/${slug}`}>{c.label(label)}</WorkspaceLink>)}</nav>
  <hr/><nav className="workspace-nav" onClick={e=>{if((e.target as HTMLElement).closest('a'))dialog.current?.close()}}>{[['talent',t.nav.talent],['how-it-works',t.nav.work],['verification',t.nav.trust],['blog',marketingCopy(locale).editorial.eyebrow.split(' · ')[0]]].map(([slug,label])=><WorkspaceLink key={slug} href={`/${locale}/${slug}`}>{label}</WorkspaceLink>)}</nav><hr/><LocaleSwitcher locale={locale} enabledLocales={enabledLocales}/><WorkspaceSignOut locale={locale}/>
 </dialog></>;
}
