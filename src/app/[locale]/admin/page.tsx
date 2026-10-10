import { notFound, redirect } from "next/navigation";
import { Dashboard } from "@/components/app-shell";
import { AdminConsole } from "@/components/admin/admin-console";
import { isLocale } from "@/lib/i18n";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { robots: { index: false, follow: false } };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const destination = `/${locale}/admin`;
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!configured) redirect(`/${locale}/auth?next=${encodeURIComponent(destination)}`);

  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/auth?next=${encodeURIComponent(destination)}`);

  const [{ data: profile, error: profileError }, { data: role, error: roleError }] = await Promise.all([
    db.from("profiles").select("account_status").eq("id", user.id).single(),
    db.from("admin_roles").select("role_id").eq("profile_id", user.id).limit(1).maybeSingle(),
  ]);
  if (profileError || roleError || profile?.account_status !== "active" || !role) notFound();

  const { module = "Overview" } = await searchParams;
  return (
    <Dashboard locale={locale} adminMode activeModule={module}>
      <AdminConsole module={module} locale={locale} />
    </Dashboard>
  );
}
