export const ACCOUNT_TYPES=["individual","team","client"] as const; export type AccountType=typeof ACCOUNT_TYPES[number];
export type Money={amountMinor:number;currency:string};
export function calculateTransaction(grossMinor:number,providerFeeMinor:number,deductionBps=700){if(!Number.isSafeInteger(grossMinor)||grossMinor<=0)throw new Error("Gross must be a positive integer");if(!Number.isSafeInteger(providerFeeMinor)||providerFeeMinor<0)throw new Error("Provider fee must be a non-negative integer");if(!Number.isInteger(deductionBps)||deductionBps<0||deductionBps>10000)throw new Error("Invalid deduction");const platformDeduction=Math.round(grossMinor*deductionBps/10000);if(providerFeeMinor>platformDeduction)throw new Error("Provider fee exceeds total deduction");return {grossMinor,platformDeductionMinor:platformDeduction,providerFeeMinor,platformRevenueMinor:platformDeduction-providerFeeMinor,workerEntitlementMinor:grossMinor-platformDeduction}}
export const PROJECT_STATUSES=["offer_accepted","awaiting_payment","funded","in_progress","submitted","client_review","completed","disputed","appeal","cancelled","refunded","payout_pending","paid"] as const;
export function canStartWork(status:string,paymentCaptured:boolean){return paymentCaptured&&["funded","in_progress"].includes(status)}
export function shouldAutoAccept(submittedAt:Date,now:Date,hasOpenDispute:boolean){return !hasOpenDispute&&now.getTime()>=submittedAt.getTime()+72*60*60*1000}
export function canAppeal(decidedAt:Date,now:Date,existingAppeals:number){return existingAppeals===0&&now.getTime()>=decidedAt.getTime()&&now.getTime()<decidedAt.getTime()+12*60*60*1000}
export type ConversationMessage={body:string;createdAt:Date};
const direct=/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|(?:https?:\/\/|www\.)\S+|(?:whats?app|telegram|واتساب|تلغرام|تليجرام)|@[a-z0-9_]{4,}/iu;
export function normalizeContactText(value:string){
 return value.normalize("NFKC").replace(/[٠-٩۰-۹]/g,c=>String(c.charCodeAt(0)-(c<="٩"?0x660:0x6f0))).replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g,"");
}
export function moderateConversation(recent:ConversationMessage[],body:string){
 const now=Date.now(),current=normalizeContactText(body);
 const context=recent.filter(x=>now-x.createdAt.getTime()<=600000).slice(-5).map(x=>normalizeContactText(x.body)).concat(current).join(" ");
 const fragment=/^\s*\+?[0-9 .()_-]{1,20}\s*$/.test(current);
 const suspicious=direct.test(current)||fragment||current.replace(/\D/g,"").length>=9||(/[0-9@]/.test(current)&&context.replace(/\D/g,"").length>=9)||/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(context.replace(/\s/g,""));
 return {status:suspicious?"pending_moderation" as const:"delivered" as const,reason:suspicious?"potential_external_contact" as const:null,reviewDeadline:suspicious?new Date(now+24*60*60*1000):null};
}
export type Permission=string; export function hasPermission(grants:Permission[],required:Permission){return grants.includes("*")||grants.includes(required)}

