export {PortfolioPanel} from "@/components/workspace/panels/portfolio-panel";
export {OffersPanel} from "@/components/workspace/panels/offers-panel";
export {ProjectsPanel} from "@/components/workspace/panels/projects-panel";
export {DisputesPanel} from "@/components/workspace/panels/disputes-panel";
export {ReviewsPanel} from "@/components/workspace/panels/reviews-panel";
import {BankOfPalestinePreview} from "@/components/workspace/bank-of-palestine-preview";
import {PaymentsPanel as LedgerPanel} from "@/components/workspace/panels/payments-panel";
export function PaymentsPanel({locale="en",accountType}:{locale?:"ar"|"en"|"tr"|"es"|"fr"|"de";accountType?:string}){
 return <div className="grid">{accountType==="client"&&<BankOfPalestinePreview locale={locale}/>}<LedgerPanel locale={locale}/></div>;
}
export {NotificationsPanel} from "@/components/workspace/panels/notifications-panel";
export {MessagesPanel} from "@/components/workspace/panels/messages-panel";
