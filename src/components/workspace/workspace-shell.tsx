import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { uiCopy } from "@/lib/ui-copy";
import { WorkspaceSignOut } from "@/components/workspace/workspace-signout";

const routes = {
  individual: [
    ["overview", ""],
    ["profile", "profile"],
    ["portfolio", "portfolio"],
    ["verification", "verification"],
    ["appointments", "appointments"],
    ["offers", "offers"],
    ["projects", "projects"],
    ["messages", "messages"],
    ["payments", "payments"],
    ["disputes", "disputes"],
    ["reviews", "reviews"],
    ["cv", "cv-builder"],
    ["notifications", "notifications"],
  ],
  team: [
    ["overview", ""],
    ["profile", "profile"],
    ["portfolio", "portfolio"],
    ["verification", "verification"],
    ["appointments", "appointments"],
    ["offers", "offers"],
    ["projects", "projects"],
    ["messages", "messages"],
    ["payments", "payments"],
    ["disputes", "disputes"],
    ["reviews", "reviews"],
    ["notifications", "notifications"],
  ],
  client: [
    ["overview", ""],
    ["profile", "profile"],
    ["findTalent", "/talent"],
    ["savedTalent", "favorites"],
    ["workRequests", "work-requests"],
    ["projects", "projects"],
    ["messages", "messages"],
    ["payments", "payments"],
    ["disputes", "disputes"],
    ["reviews", "reviews"],
    ["notifications", "notifications"],
  ],
} as const;

export async function WorkspaceShell({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const ui = uiCopy(locale).workspace;
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/auth`);

  const { data: profile } = await db
    .from("profiles")
    .select("account_type,display_name,onboarding_complete,account_status")
    .eq("id", user.id)
    .single();
  if (!profile) redirect(`/${locale}/auth`);

  const type = profile.account_type as keyof typeof routes;
  const nav = routes[type] ?? routes.individual;

  let verification: string | null = null;
  if (type !== "client") {
    const table = type === "individual" ? "individual_profiles" : "team_profiles";
    const key = type === "individual" ? "professional_title" : "team_name";
    const { data } = await db
      .from(table)
      .select(`verification_status,${key}`)
      .eq("profile_id", user.id)
      .single();
    verification = (data as Record<string, unknown> | null)?.verification_status as string | null;
  }

  const accountType =
    type === "individual"
      ? ui.individualAccount
      : type === "team"
        ? ui.teamAccount
        : ui.clientAccount;

  const verificationLabel = verification
    ? ui.status[verification] ?? verification.replaceAll("_", " ")
    : null;

  return (
    <div className="workspace-layout">
      <aside className="workspace-sidebar">
        <div className="workspace-identity">
          <span className="badge">{accountType}</span>
          <strong>{profile.display_name}</strong>
          <small className="muted">
            {profile.onboarding_complete ? ui.profileReady : ui.profileIncomplete}
          </small>
          {verificationLabel && (
            <small className="muted">{ui.verification}: {verificationLabel}</small>
          )}
        </div>

        <nav className="workspace-nav">
          {nav.map(([key, slug]) => {
            const href = slug.startsWith("/")
              ? `/${locale}${slug}`
              : `/${locale}/dashboard/${slug}`;
            return <Link key={key} href={href}>{ui.nav[key]}</Link>;
          })}
        </nav>
        <WorkspaceSignOut locale={locale} />
      </aside>

      <div className="workspace-main">
        <details className="workspace-mobile-menu">
          <summary>{ui.menu} <span>☰</span></summary>
          <div className="workspace-mobile-panel">
            <div className="workspace-mobile-identity">
              <strong>{profile.display_name}</strong>
              <small>{accountType}</small>
            </div>
            {nav.map(([key, slug]) => {
              const href = slug.startsWith("/")
                ? `/${locale}${slug}`
                : `/${locale}/dashboard/${slug}`;
              return <Link key={key} href={href}>{ui.nav[key]}</Link>;
            })}
            <WorkspaceSignOut locale={locale} />
          </div>
        </details>
        {children}
      </div>
    </div>
  );
}
