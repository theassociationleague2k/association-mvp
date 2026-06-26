import Link from "next/link";
import type { CSSProperties } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Badge = {
  name: string;
  description: string;
  icon: string;
};

type StatBlock = {
  value: number | null;
  grade: string;
};

type ProfileJson = {
  playerName?: string;

  badges?: Badge[];

  styleAndRole?: {
    comp?: string;
    role?: string;
    fit?: string;
  };

  perGame?: {
    ppg?: StatBlock;
    apg?: StatBlock;
    rpg?: StatBlock;
    spg?: StatBlock;
    bpg?: StatBlock;
    topg?: StatBlock;
  };

  efficiency?: {
    astToTurnover?: StatBlock;
    fgPct?: StatBlock;
    threePct?: StatBlock;
    ftPct?: StatBlock;
  };

  winPct?: StatBlock;

  tier?: string;

  associationLeader?: string[];

  scouting?: {
    strengths?: string;
    weaknesses?: string;
    finalSummary?: string;
  };

  media?: {
    uploadedCardUrl?: string;
    storagePath?: string;
  };
};

function formatValue(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined) return "—";
  return `${value}${suffix}`;
}

function getGradeBadgeStyle(grade: string | null | undefined): CSSProperties {
  const normalizedGrade = grade?.trim().toUpperCase() || "N/A";

  const base: CSSProperties = {
    borderRadius: "8px",
    padding: "7px 12px",
    fontWeight: 950,
    minWidth: "48px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "14px",
  };

  if (normalizedGrade === "S" || normalizedGrade === "S+") {
    return {
      ...base,
      background: "linear-gradient(135deg, #4c1d95, #9333ea)",
      color: "#faf5ff",
      boxShadow: "0 0 16px rgba(147,51,234,0.35)",
    };
  }

  if (normalizedGrade.startsWith("A")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #064e3b, #22c55e)",
      color: "#ecfdf5",
      boxShadow: "0 0 14px rgba(34,197,94,0.25)",
    };
  }

  if (normalizedGrade.startsWith("B")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      color: "#eff6ff",
      boxShadow: "0 0 14px rgba(59,130,246,0.22)",
    };
  }

  if (normalizedGrade.startsWith("C")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #ca8a04, #facc15)",
      color: "#1c1917",
      boxShadow: "0 0 14px rgba(250,204,21,0.3)",
    };
  }

  if (normalizedGrade.startsWith("D")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #7c2d12, #f97316)",
      color: "#fff7ed",
      boxShadow: "0 0 14px rgba(249,115,22,0.22)",
    };
  }

  if (normalizedGrade.startsWith("F")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #450a0a, #dc2626)",
      color: "#fef2f2",
      boxShadow: "0 0 14px rgba(220,38,38,0.25)",
    };
  }

  return {
    ...base,
    background: "linear-gradient(135deg, #27272a, #52525b)",
    color: "#f4f4f5",
  };
}

function getTierStyle(tier: string | undefined): CSSProperties {
  const normalizedTier = tier?.trim().toUpperCase() || "PENDING";

  const base: CSSProperties = {
    marginTop: "16px",
    borderRadius: "13px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textTransform: "uppercase",
    fontWeight: 950,
  };

  if (normalizedTier.startsWith("S")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #4c1d95, #9333ea)",
      color: "#faf5ff",
      boxShadow: "0 0 20px rgba(147,51,234,0.35)",
    };
  }

  if (normalizedTier.startsWith("A")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #064e3b, #22c55e)",
      color: "#ecfdf5",
    };
  }

  if (normalizedTier.startsWith("B")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      color: "#eff6ff",
    };
  }

  if (normalizedTier.startsWith("C")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #ca8a04, #facc15)",
      color: "#1c1917",
    };
  }

  if (normalizedTier.startsWith("D")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #7c2d12, #f97316)",
      color: "#fff7ed",
    };
  }

  if (normalizedTier.startsWith("F")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #450a0a, #dc2626)",
      color: "#fef2f2",
    };
  }

  return {
    ...base,
    background: "linear-gradient(135deg, #27272a, #52525b)",
    color: "#f4f4f5",
  };
}

function StatRow({
  label,
  stat,
  suffix = "",
}: {
  label: string;
  stat: StatBlock | undefined;
  suffix?: string;
}) {
  return (
    <div className="statRow">
      <span className="statLabel">{label}</span>

      <div className="statRight">
        <span className="statValue">{formatValue(stat?.value, suffix)}</span>

        <span style={getGradeBadgeStyle(stat?.grade)}>
          {stat?.grade ?? "N/A"}
        </span>
      </div>
    </div>
  );
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerName: string }>;
}) {
  const { playerName } = await params;
  const decodedPlayerName = decodeURIComponent(playerName);

  const { data: player, error: playerError } = await supabaseAdmin
    .from("players")
    .select("id, player_name, display_name")
    .eq("player_name", decodedPlayerName)
    .single();

  if (playerError || !player) {
    return (
      <main className="page">
        <style>{pageCss}</style>

        <Link href="/players" className="backLink">
          ← Back to roster
        </Link>

        <section className="errorBox">
          <h1>Player Not Found</h1>
          <p>Could not find this player profile.</p>
        </section>
      </main>
    );
  }

  const { data: card, error: cardError } = await supabaseAdmin
    .from("player_cards")
    .select("id, image_url, storage_path, tier, profile_json, created_at")
    .eq("player_id", player.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (cardError || !card) {
    return (
      <main className="page">
        <style>{pageCss}</style>

        <Link href="/players" className="backLink">
          ← Back to roster
        </Link>

        <section className="errorBox">
          <h1>No Card Saved</h1>
          <p>This player exists, but no player card profile is saved yet.</p>
        </section>
      </main>
    );
  }

  const profile = card.profile_json as ProfileJson;

  const displayName =
    profile.playerName || player.display_name || player.player_name;

  return (
    <main className="page">
      <style>{pageCss}</style>

      <header className="header">
        <Link href="/" className="logo">
          The Association
        </Link>

        <nav className="nav">
          <Link href="/players" className="navLink">
            Roster
          </Link>

          <Link href="/submit-player" className="navButton">
            Submit Player
          </Link>
        </nav>
      </header>

      <section className="grid">
        <aside className="leftPanel">
          <h1 className="playerName">{displayName}</h1>

          <section className="section">
            <h3 className="sectionTitle">Badges</h3>

            <div className="badgeStack">
              {(profile.badges ?? []).map((badge) => (
                <div
                  key={`${badge.name}-${badge.description}`}
                  className="badgeCard"
                >
                  <div className="badgeName">
                    <span>{badge.icon}</span>
                    <strong>{badge.name}</strong>
                  </div>

                  <p className="badgeDescription">{badge.description}</p>
                </div>
              ))}

              {(profile.badges ?? []).length === 0 && (
                <p className="muted">No badges saved yet.</p>
              )}
            </div>
          </section>

          <section className="section">
            <h3 className="sectionTitle">Style & Role</h3>

            <div className="roleRow">
              <strong>Role</strong>
              <span>{profile.styleAndRole?.role ?? "Pending"}</span>
            </div>

            <div className="roleRow">
              <strong>Fit</strong>
              <span>{profile.styleAndRole?.fit ?? "Pending"}</span>
            </div>
          </section>
        </aside>

        <section className="middlePanel">
          <h2 className="panelTitle">Per-Game</h2>

          <StatRow label="PPG" stat={profile.perGame?.ppg} />
          <StatRow label="APG" stat={profile.perGame?.apg} />
          <StatRow label="RPG" stat={profile.perGame?.rpg} />
          <StatRow label="SPG" stat={profile.perGame?.spg} />
          <StatRow label="BPG" stat={profile.perGame?.bpg} />

          {profile.perGame?.topg && (
            <StatRow label="TOPG" stat={profile.perGame.topg} />
          )}

          <div className="divider" />

          <StatRow label="AST/TO" stat={profile.efficiency?.astToTurnover} />
          <StatRow label="FG%" stat={profile.efficiency?.fgPct} suffix="%" />
          <StatRow label="3PT%" stat={profile.efficiency?.threePct} suffix="%" />
          <StatRow label="FT%" stat={profile.efficiency?.ftPct} suffix="%" />

          <div className="divider" />

          <StatRow label="WIN%" stat={profile.winPct} suffix="%" />

          <div style={getTierStyle(profile.tier)}>
            <span>Tier</span>
            <strong>{profile.tier ?? "Pending"}</strong>
          </div>

          {(profile.associationLeader ?? []).length > 0 && (
            <section className="section">
              <h3 className="sectionTitle">Association Leader</h3>

              <div className="leaderStack">
                {(profile.associationLeader ?? []).map((leader) => (
                  <div key={leader} className="leaderBadge">
                    {leader}
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>

        <section className="rightPanel">
          <article className="scoutingBox">
            <h2 className="scoutingTitle">Strengths</h2>
            <p className="scoutingText">
              {profile.scouting?.strengths ?? "Strengths pending."}
            </p>
          </article>

          <article className="scoutingBox">
            <h2 className="scoutingTitle">Weaknesses</h2>
            <p className="scoutingText">
              {profile.scouting?.weaknesses ?? "Weaknesses pending."}
            </p>
          </article>

          <article className="summaryBox">
            <h2 className="summaryTitle">Final Scouting Summary</h2>
            <p className="scoutingText">
              {profile.scouting?.finalSummary ?? "Final summary pending."}
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}

const pageCss = `
  * {
    box-sizing: border-box;
  }

  .page {
    min-height: 100vh;
    background: radial-gradient(circle at top, #1b1b1b 0%, #060606 42%, #000 100%);
    color: white;
    padding: max(18px, env(safe-area-inset-top)) clamp(14px, 3vw, 28px) 28px;
    font-family: Arial, Helvetica, sans-serif;
    overflow-x: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .logo {
    color: #facc15;
    font-weight: 950;
    font-size: clamp(22px, 6vw, 28px);
    text-decoration: none;
    letter-spacing: -0.8px;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .navLink {
    color: white;
    text-decoration: none;
    font-weight: 800;
    opacity: 0.85;
  }

  .navButton {
    color: #facc15;
    text-decoration: none;
    border: 1px solid rgba(250,204,21,0.7);
    padding: 10px 12px;
    border-radius: 10px;
    font-weight: 900;
    text-transform: uppercase;
    font-size: 12px;
    white-space: nowrap;
  }

  .backLink {
    color: #facc15;
    text-decoration: none;
    font-weight: 900;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 0.85fr) minmax(0, 1.2fr);
    gap: 22px;
    align-items: stretch;
    width: 100%;
  }

  .leftPanel,
  .middlePanel,
  .scoutingBox,
  .summaryBox,
  .errorBox {
    background: rgba(8,8,8,0.95);
    border-radius: 18px;
  }

  .leftPanel {
    border: 1px solid rgba(250,204,21,0.5);
    padding: clamp(16px, 4vw, 22px);
    box-shadow: 0 0 30px rgba(250,204,21,0.06);
    min-width: 0;
  }

  .middlePanel {
    border: 1px solid rgba(255,255,255,0.16);
    padding: clamp(16px, 4vw, 22px);
    min-width: 0;
  }

  .rightPanel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-width: 0;
  }

  .playerName {
    margin: 0 0 22px;
    color: #facc15;
    font-size: clamp(30px, 9vw, 42px);
    line-height: 1;
    letter-spacing: -1px;
    overflow-wrap: anywhere;
  }

  .panelTitle {
    margin: 0 0 18px;
    text-align: center;
    color: #facc15;
    text-transform: uppercase;
    font-size: clamp(26px, 8vw, 34px);
    letter-spacing: 1px;
  }

  .section {
    margin-top: 20px;
  }

  .sectionTitle {
    margin: 0 0 12px;
    color: #facc15;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 1.5px;
  }

  .badgeStack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .badgeCard {
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 12px;
    min-width: 0;
  }

  .badgeName {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 950;
    font-size: 16px;
    overflow-wrap: anywhere;
  }

  .badgeDescription {
    margin: 7px 0 0;
    color: #cbd5e1;
    font-size: 13px;
    line-height: 1.35;
  }

  .roleRow {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 10px;
    border-top: 1px solid rgba(255,255,255,0.11);
    padding: 12px 0;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .statRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding: 11px 0;
  }

  .statLabel {
    color: #cbd5e1;
    font-weight: 900;
    font-size: 16px;
  }

  .statRight {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .statValue {
    font-size: clamp(20px, 6vw, 25px);
    font-weight: 950;
  }

  .divider {
    height: 1px;
    background: rgba(250,204,21,0.35);
    margin: 16px 0;
  }

  .leaderStack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .leaderBadge {
    background: rgba(255,255,255,0.06);
    border-radius: 9px;
    padding: 12px;
    color: #facc15;
    font-weight: 950;
  }

  .scoutingBox {
    border: 1px solid rgba(255,255,255,0.14);
    padding: clamp(16px, 4vw, 22px);
    min-height: auto;
  }

  .scoutingTitle {
    margin: 0 0 14px;
    font-size: clamp(26px, 7vw, 34px);
    line-height: 1.1;
  }

  .scoutingText {
    color: #cbd5e1;
    line-height: 1.55;
    margin: 0;
    overflow-wrap: anywhere;
    font-size: 15px;
  }

  .summaryBox {
    color: #f8e08e;
    border: 1px solid rgba(250,204,21,0.75);
    padding: clamp(16px, 4vw, 22px);
    line-height: 1.55;
    font-weight: 500;
    box-shadow: 0 0 24px rgba(250,204,21,0.08);
    min-height: auto;
  }

  .summaryTitle {
    margin: 0 0 14px;
    color: #f8e08e;
    font-size: clamp(26px, 7vw, 34px);
    line-height: 1.1;
  }

  .muted {
    color: #94a3b8;
  }

  .errorBox {
    margin-top: 30px;
    border: 1px solid rgba(250,204,21,0.35);
    padding: 24px;
  }

  @media (max-width: 1050px) {
    .grid {
      grid-template-columns: 1fr;
    }

    .middlePanel {
      order: 1;
    }

    .leftPanel {
      order: 2;
    }

    .rightPanel {
      order: 3;
    }
  }

  @media (max-width: 600px) {
    .page {
      padding-left: 14px;
      padding-right: 14px;
      padding-bottom: 22px;
    }

    .header {
      margin-bottom: 18px;
    }

    .nav {
      width: 100%;
      justify-content: space-between;
    }

    .navButton,
    .navLink {
      font-size: 12px;
    }

    .leftPanel,
    .middlePanel,
    .scoutingBox,
    .summaryBox {
      border-radius: 16px;
    }

    .roleRow {
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .statRow {
      padding: 12px 0;
    }

    .statRight {
      gap: 8px;
    }

    .scoutingText {
      font-size: 14px;
    }
  }
`;