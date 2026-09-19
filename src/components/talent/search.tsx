"use client";

import { FormEvent, useEffect, useState } from "react";
import { uiCopy } from "@/lib/ui-copy";

type Skill = {
  id: string;
  slug: string;
  skill_translations: { locale: string; name: string }[];
};

type Talent = {
  id: string;
  account_type: "individual" | "team";
  display_name: string;
  rating?: number | null;
  review_count?: number;
  individual_profiles?: {
    professional_title?: string;
    bio?: string;
    availability?: string;
    years_experience?: number;
    hourly_rate_minor?: number;
    currency?: string;
    verification_status: string;
  } | null;
  team_profiles?: {
    team_name?: string;
    description?: string;
    team_size?: number;
    rate_minor?: number;
    currency?: string;
    verification_status: string;
  } | null;
};

function money(minor: number | undefined, currency: string | undefined, locale: string) {
  if (!minor || !currency) return null;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
}

export function TalentSearch({ locale }: { locale: string }) {
  const ui = uiCopy(locale).talent;
  const [items, setItems] = useState<Talent[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [state, setState] = useState(ui.intro);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void fetch("/api/taxonomy").then(async (response) => {
      if (response.ok) setSkills((await response.json()).skills ?? []);
    });
  }, []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(ui.searching);
    setNotice("");

    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams({
      q: String(form.get("q") ?? ""),
      type: String(form.get("type") ?? ""),
      skillId: String(form.get("skillId") ?? ""),
      minExperience: String(form.get("minExperience") ?? ""),
      maxRate: String(form.get("maxRate") ?? ""),
    });

    const response = await fetch("/api/talent?" + params.toString());
    if (!response.ok) {
      setItems([]);
      setState(response.status === 401 ? ui.signInRequired : ui.unavailable);
      return;
    }

    const rows = await response.json();
    setItems(rows);
    setState(rows.length ? "" : ui.noMatch);
  }

  async function save(id: string) {
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ talentId: id }),
    });
    setNotice(response.ok ? ui.saved : ui.clientOnly);
  }

  async function invite(id: string) {
    const workRequestId = prompt(ui.invitePrompt);
    if (!workRequestId) return;

    const response = await fetch("/api/work-requests/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workRequestId, talentId: id }),
    });
    setNotice(response.ok ? ui.invitationSent : ui.inviteFailed);
  }

  return (
    <>
      <form className="card talent-filters" onSubmit={search}>
        <label>
          {ui.profession}
          <input name="q" />
        </label>
        <label>
          {ui.talentType}
          <select name="type">
            <option value="">{ui.both}</option>
            <option value="individual">{ui.individuals}</option>
            <option value="team">{ui.teams}</option>
          </select>
        </label>
        <label>
          {ui.skill}
          <select name="skillId">
            <option value="">{ui.anySkill}</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.skill_translations.find((item) => item.locale === locale)?.name
                  ?? skill.skill_translations.find((item) => item.locale === "en")?.name
                  ?? skill.slug}
              </option>
            ))}
          </select>
        </label>
        <label>
          {ui.minExperience}
          <input name="minExperience" type="number" min="0" max="80" />
        </label>
        <label>
          {ui.maxRate}
          <input name="maxRate" type="number" min="0" />
        </label>
        <button className="btn talent-search-button">{ui.search}</button>
      </form>

      {notice && <p role="status" className="talent-notice">{notice}</p>}
      {state && <div className="empty talent-state">{state}</div>}

      <div className="talent-results">
        {items.map((talent) => {
          const individual = Array.isArray(talent.individual_profiles)
            ? talent.individual_profiles[0]
            : talent.individual_profiles;
          const team = Array.isArray(talent.team_profiles)
            ? talent.team_profiles[0]
            : talent.team_profiles;

          const experience = individual?.years_experience !== undefined
            ? ui.yearsExperience(individual.years_experience)
            : "";
          const price = money(individual?.hourly_rate_minor, individual?.currency, locale)
            ?? money(team?.rate_minor, team?.currency, locale)
            ?? ui.priceByOffer;

          return (
            <article className="card talent-result-card" key={talent.id}>
              <div className="talent-card-topline">
                <span className="badge">✓ {ui.verified}</span>
                <span className="talent-type-pill">
                  {talent.account_type === "team" ? ui.teams : ui.individuals}
                </span>
              </div>
              <h2>{talent.display_name}</h2>
              <strong>{individual?.professional_title ?? team?.team_name}</strong>
              <p className="muted">
                {individual?.bio ?? team?.description ?? ui.profilePrivate}
              </p>
              <div className="talent-meta">
                <span>
                  <strong>{talent.rating ?? ui.newTalent}</strong>
                  {talent.review_count ? ` · ${ui.reviews(talent.review_count)}` : ""}
                </span>
                <span>{experience}{price}</span>
              </div>
              <div className="form-actions">
                <button className="btn secondary" onClick={() => void save(talent.id)}>
                  {ui.saveTalent}
                </button>
                <button className="btn" onClick={() => void invite(talent.id)}>
                  {ui.invite}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
