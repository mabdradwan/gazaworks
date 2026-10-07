"use client";
import {useParams} from "next/navigation";
import {LoadingIndicator} from "@/components/loading-indicator";
export default function Loading(){const params=useParams<{locale:string}>();return <div className="route-loading"><LoadingIndicator locale={params.locale}/></div>}
