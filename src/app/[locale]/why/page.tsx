import {notFound} from "next/navigation"; import {PublicPage} from "@/components/public-page"; import {isLocale} from "@/lib/i18n";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <PublicPage locale={locale} page="why"/>}
