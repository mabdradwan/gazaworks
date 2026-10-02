import { notFound } from "next/navigation";
import Link from "next/link";
import { TalentSearch } from "@/components/talent/search";
import { AIAssistant } from "@/components/ai-assistant";
import { isLocale } from "@/lib/i18n";
import { uiCopy } from "@/lib/ui-copy";
import { supabaseServer } from "@/lib/supabase/server";
import styles from "@/components/talent/talent.module.css";

export const metadata = { robots: { index: false, follow: false } };

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ui = uiCopy(locale);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const session = configured ? await supabaseServer() : null;
  const user = session ? (await session.auth.getUser()).data.user : null;
  let canBrowse = false;
  if (session && user) {
    const { data: profile } = await session.from("profiles").select("account_type,account_status").eq("id", user.id).single();
    if (profile?.account_status === "active") {
      canBrowse = profile.account_type === "client"
        || Boolean((await session.rpc("has_permission", { required: "users.read" })).data);
    }
  }

  return (
    <section className={`container talent-page${canBrowse ? "" : ` ${styles.guestPage}`}`}>
      <div className="talent-page-hero">
        <span className="badge premium-badge">{ui.pages.talentBadge}</span>
        <h1>{ui.pages.talentTitle}</h1>
        <p className="muted">{ui.talent.intro}</p>
      </div>
      {canBrowse ? (
        <>
          <AIAssistant locale={locale} mode="talent_search" />
          <TalentSearch locale={locale} />
        </>
      ) : (
        <div className={`card ${styles.accessCard}`}>
          <p>{user ? ui.talent.clientOnlySearch : ui.talent.signInRequired}</p>
          {!user && <Link className="btn" href={`/${locale}/auth?next=${encodeURIComponent(`/${locale}/talent`)}`}>{ui.auth.signIn}</Link>}
        </div>
      )}
    </section>
  );
}
