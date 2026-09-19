import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { uiCopy } from "@/lib/ui-copy";

export async function WorkspaceOverview({ locale }: { locale: string }) {
  const ui = uiCopy(locale).workspace;
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("account_type,display_name,onboarding_complete")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  const [projects, notifications, rooms, portfolio, requests] = await Promise.all([
    db.from("projects").select("id,status", { count: "exact", head: true }).or(`client_id.eq.${user.id},talent_id.eq.${user.id}`),
    db.from("notifications").select("id", { count: "exact", head: true }).eq("profile_id", user.id).is("read_at", null),
    db.from("chat_participants").select("room_id", { count: "exact", head: true }).eq("profile_id", user.id),
    db.from("portfolios").select("id", { count: "exact", head: true }).eq("profile_id", user.id),
    db.from("work_requests").select("id", { count: "exact", head: true }).eq("client_id", user.id),
  ]);

  let verification = ui.notApplicable;
  if (profile.account_type !== "client") {
    const table = profile.account_type === "individual" ? "individual_profiles" : "team_profiles";
    const { data } = await db
      .from(table)
      .select("verification_status")
      .eq("profile_id", user.id)
      .single();
    const raw = String(data?.verification_status ?? "draft");
    verification = ui.status[raw] ?? raw.replaceAll("_", " ");
  }

  const cards = [
    [ui.projects, projects.count ?? 0, "projects"],
    [ui.unreadNotifications, notifications.count ?? 0, "notifications"],
    [ui.conversations, rooms.count ?? 0, "messages"],
    [
      profile.account_type === "client" ? ui.workRequests : ui.portfolio,
      profile.account_type === "client" ? requests.count ?? 0 : portfolio.count ?? 0,
      profile.account_type === "client" ? "work-requests" : "portfolio",
    ],
  ] as const;

  const accountType =
    profile.account_type === "individual"
      ? ui.individual
      : profile.account_type === "team"
        ? ui.team
        : ui.client;

  return (
    <section className="workspace-page">
      <div className="workspace-welcome">
        <div>
          <span className="badge">{ui.professionalWorkspace}</span>
          <h1>{ui.welcome}, {profile.display_name}</h1>
          <p className="muted">{ui.welcomeBody}</p>
        </div>
        <Link className="btn" href={`/${locale}/dashboard/profile`}>
          {profile.onboarding_complete ? ui.editProfile : ui.completeProfile}
        </Link>
      </div>

      <div className="dashboard-stats">
        {cards.map(([label, value, slug]) => (
          <Link className="stat-card" key={String(label)} href={`/${locale}/dashboard/${slug}`}>
            <small className="muted">{label}</small>
            <strong>{value}</strong>
            <span>{ui.open}</span>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>{ui.accountStatus}</h2>
          <div className="status-list">
            <div>
              <span>{ui.profile}</span>
              <strong>{profile.onboarding_complete ? ui.ready : ui.incomplete}</strong>
            </div>
            <div>
              <span>{ui.verification}</span>
              <strong>{verification}</strong>
            </div>
            <div>
              <span>{ui.accountType}</span>
              <strong>{accountType}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>{ui.recommended}</h2>
          {profile.account_type === "client" ? (
            <>
              <p className="muted">{ui.clientNext}</p>
              <div className="form-actions">
                <Link className="btn" href={`/${locale}/talent`}>{ui.findTalent}</Link>
                <Link className="btn secondary" href={`/${locale}/dashboard/work-requests`}>
                  {ui.postWorkRequest}
                </Link>
              </div>
            </>
          ) : profile.onboarding_complete ? (
            <>
              <p className="muted">{ui.verifiedNext}</p>
              <Link className="btn" href={`/${locale}/dashboard/verification`}>
                {ui.continueVerification}
              </Link>
            </>
          ) : (
            <>
              <p className="muted">{ui.profileNext}</p>
              <Link className="btn" href={`/${locale}/dashboard/profile`}>
                {ui.completeProfessionalProfile}
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
