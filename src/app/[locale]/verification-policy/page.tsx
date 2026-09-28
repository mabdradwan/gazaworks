import { PolicyPage } from "@/components/policy-page";
export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <PolicyPage slug="verification-policy" params={params} />;
}
