import { PolicyPage } from "@/components/policy-page";
export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <PolicyPage slug="privacy" params={params} />;
}
