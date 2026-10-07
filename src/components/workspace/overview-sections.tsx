'use client';
import dynamic from 'next/dynamic';
import {useState} from 'react';
import {workspaceCopy} from '@/lib/workspace-copy';
const ProjectsPanel=dynamic(()=>import('./panels/projects-panel').then(m=>m.ProjectsPanel));
const MessagesPanel=dynamic(()=>import('./panels/messages-panel').then(m=>m.MessagesPanel));
const ReviewsPanel=dynamic(()=>import('./panels/reviews-panel').then(m=>m.ReviewsPanel));
const NotificationsPanel=dynamic(()=>import('./panels/notifications-panel').then(m=>m.NotificationsPanel));
const PaymentsPanel=dynamic(()=>import('./panels/payments-panel').then(m=>m.PaymentsPanel));
const DisputesPanel=dynamic(()=>import('./panels/disputes-panel').then(m=>m.DisputesPanel));
const OffersPanel=dynamic(()=>import("./panels/offers-panel").then(m=>m.OffersPanel));
const DirectHirePanel=dynamic(()=>import("./direct-hire-panel").then(m=>m.DirectHirePanel));
export function OverviewSections({locale,initialTab="Projects"}:{locale:string;initialTab?:string}){
 const c=workspaceCopy(locale),[tab,setTab]=useState(['Projects','Messages','Reviews','Notifications','Payments','Disputes','Offers','Direct Hire'].includes(initialTab)?initialTab:'Projects');
 const panels={Projects:ProjectsPanel,Messages:MessagesPanel,Reviews:ReviewsPanel,Notifications:NotificationsPanel,Payments:PaymentsPanel,Disputes:DisputesPanel,Offers:OffersPanel,"Direct Hire":DirectHirePanel};
 const Panel=panels[tab as keyof typeof panels];
 return <section><div className="overview-tabs" role="tablist" aria-label={c.label('Overview')}>{Object.keys(panels).map(label=><button type="button" role="tab" aria-selected={tab===label} aria-controls="overview-panel" id={`tab-${label}`} key={label} className={tab===label?'btn':'btn secondary'} onClick={()=>setTab(label)}>{c.label(label)}</button>)}</div><div role="tabpanel" id="overview-panel" aria-labelledby={`tab-${tab}`}><Panel locale={locale}/></div></section>;
}
