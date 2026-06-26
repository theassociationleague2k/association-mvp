import Link from "next/link";
import type { CSSProperties } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
    ...styles.gradeBadge,
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

  if (normalizedTier.startsWith("S")) {
    return {
      ...styles.tierBar,
      background: "linear-gradient(135deg, #4c1d95, #9333ea)",
      color: "#faf5ff",
      boxShadow: "0 0 20px rgba(147,51,234,0.35)",
    };
  }

  if (normalizedTier.startsWith("A")) {
    return {
      ...styles.tierBar,
      background: "linear-gradient(135deg, #064e3b, #22c55e)",
      color: "#ecfdf5",
    };
  }

  if (normalizedTier.startsWith("B")) {
    return {
      ...styles.tierBar,
      background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      color: "#eff6ff",
    };
  }

  if (normalizedTier.startsWith("C")) {
    return {
      ...styles.tierBar,
      background: "linear-gradient(135deg, #ca8a04, #facc15)",
      color: "#1c1917",
    };
  }

  if (normalizedTier.startsWith("D")) {
    return {
      ...styles.tierBar,
      background: "linear-gradient(135deg, #7c2d12, #f97316)",
      color: "#fff7ed",
    };
  }

  if (normalizedTier.startsWith("F")) {
    return {
      ...styles.tierBar,
      background: "linear-gradient(135deg, #450a0a, #dc2626)",
      color: "#fef2f2",
    };
  }

  return styles.tierBar;
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
    <div style={styles.statRow}>
      <span style={styles.statLabel}>{label}</span>

      <div style={styles.statRight}>
        <span style={styles.statValue}>
          {formatValue(stat?.value, suffix)}
        </span>

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
      <main style={styles.page}>
        <Link href="/players" style={styles.backLink}>
          ← Back to roster
        </Link>

        <section style={styles.errorBox}>
          <h1>Player Not Found</h1>
          <p>
            Could not find this player profile. The database is being dramatic
            again.
          </p>
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
      <main style={styles.page}>
        <Link href="/players" style={styles.backLink}>
          ← Back to roster
        </Link>

        <section style={styles.errorBox}>
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
    <main style={styles.page}>
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          The Association
        </Link>

        <nav style={styles.nav}>
          <Link href="/players" style={styles.navLink}>
            Roster
          </Link>

          <Link href="/submit-player" style={styles.navButton}>
            Submit Player
          </Link>
        </nav>
      </header>

      <section style={styles.grid}>
        <aside style={styles.leftPanel}>
          <h1 style={styles.playerName}>{displayName}</h1>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Badges</h3>

            <div style={styles.badgeStack}>
              {(profile.badges ?? []).map((badge) => (
                <div key={`${badge.name}-${badge.description}`} style={styles.badgeCard}>
                  <div style={styles.badgeName}>
                    <span>{badge.icon}</span>
                    <strong>{badge.name}</strong>
                  </div>

                  <p style={styles.badgeDescription}>{badge.description}</p>
                </div>
              ))}

              {(profile.badges ?? []).length === 0 && (
                <p style={styles.muted}>No badges saved yet.</p>
              )}
            </div>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Style & Role</h3>

            <div style={styles.roleRow}>
              <strong>Role</strong>
              <span>{profile.styleAndRole?.role ?? "Pending"}</span>
            </div>

            <div style={styles.roleRow}>
              <strong>Fit</strong>
              <span>{profile.styleAndRole?.fit ?? "Pending"}</span>
            </div>
          </section>
        </aside>

        <section style={styles.middlePanel}>
          <h2 style={styles.panelTitle}>Per-Game</h2>

          <StatRow label="PPG" stat={profile.perGame?.ppg} />
          <StatRow label="APG" stat={profile.perGame?.apg} />
          <StatRow label="RPG" stat={profile.perGame?.rpg} />
          <StatRow label="SPG" stat={profile.perGame?.spg} />
          <StatRow label="BPG" stat={profile.perGame?.bpg} />

          {profile.perGame?.topg && (
            <StatRow label="TOPG" stat={profile.perGame.topg} />
          )}

          <div style={styles.divider} />

          <StatRow label="AST/TO" stat={profile.efficiency?.astToTurnover} />
          <StatRow label="FG%" stat={profile.efficiency?.fgPct} suffix="%" />
          <StatRow label="3PT%" stat={profile.efficiency?.threePct} suffix="%" />
          <StatRow label="FT%" stat={profile.efficiency?.ftPct} suffix="%" />

          <div style={styles.divider} />

          <StatRow label="WIN%" stat={profile.winPct} suffix="%" />

          <div style={getTierStyle(profile.tier)}>
            <span>Tier</span>
            <strong>{profile.tier ?? "Pending"}</strong>
          </div>

          {(profile.associationLeader ?? []).length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Association Leader</h3>

              <div style={styles.leaderStack}>
                {(profile.associationLeader ?? []).map((leader) => (
                  <div key={leader} style={styles.leaderBadge}>
                    {leader}
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>

        <section style={styles.rightPanel}>
          <article style={styles.scoutingBox}>
            <h2 style={styles.scoutingTitle}>Strengths</h2>
            <p style={styles.scoutingText}>
              {profile.scouting?.strengths ?? "Strengths pending."}
            </p>
          </article>

          <article style={styles.scoutingBox}>
            <h2 style={styles.scoutingTitle}>Weaknesses</h2>
            <p style={styles.scoutingText}>
              {profile.scouting?.weaknesses ?? "Weaknesses pending."}
            </p>
          </article>

          <article style={styles.summaryBox}>
            <h2 style={styles.summaryTitle}>Final Scouting Summary</h2>
            <p style={styles.scoutingText}>
              {profile.scouting?.finalSummary ?? "Final summary pending."}
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #1b1b1b 0%, #060606 42%, #000 100%)",
    color: "white",
    padding: "28px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
  },

  logo: {
    color: "#facc15",
    fontWeight: 950,
    fontSize: "28px",
    textDecoration: "none",
    letterSpacing: "-0.8px",
  },

  nav: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  navLink: {
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
    opacity: 0.85,
  },

  navButton: {
    color: "#facc15",
    textDecoration: "none",
    border: "1px solid rgba(250,204,21,0.7)",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 900,
    textTransform: "uppercase",
    fontSize: "13px",
  },

  backLink: {
    color: "#facc15",
    textDecoration: "none",
    fontWeight: 900,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 0.85fr 1.2fr",
    gap: "22px",
    alignItems: "stretch",
  },

  leftPanel: {
    background: "rgba(8,8,8,0.95)",
    border: "1px solid rgba(250,204,21,0.5)",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 0 30px rgba(250,204,21,0.06)",
  },

  middlePanel: {
    background: "rgba(8,8,8,0.95)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "18px",
    padding: "22px",
  },

  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  playerName: {
    margin: "0 0 24px",
    color: "#facc15",
    fontSize: "34px",
    letterSpacing: "-1px",
  },

  panelTitle: {
    margin: "0 0 20px",
    textAlign: "center",
    color: "#facc15",
    textTransform: "uppercase",
    fontSize: "30px",
    letterSpacing: "1px",
  },

  section: {
    marginTop: "20px",
  },

  sectionTitle: {
    margin: "0 0 12px",
    color: "#facc15",
    textTransform: "uppercase",
    fontSize: "13px",
    letterSpacing: "1.5px",
  },

  badgeStack: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  badgeCard: {
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding: "12px",
  },

  badgeName: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 950,
    fontSize: "16px",
  },

  badgeDescription: {
    margin: "7px 0 0",
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: 1.35,
  },

  roleRow: {
    display: "grid",
    gridTemplateColumns: "64px 1fr",
    gap: "10px",
    borderTop: "1px solid rgba(255,255,255,0.11)",
    padding: "12px 0",
    lineHeight: 1.4,
  },

  statRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    padding: "11px 0",
  },

  statLabel: {
    color: "#cbd5e1",
    fontWeight: 900,
    fontSize: "16px",
  },

  statRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  statValue: {
    fontSize: "23px",
    fontWeight: 950,
  },

  gradeBadge: {
    borderRadius: "8px",
    padding: "7px 14px",
    fontWeight: 950,
    minWidth: "54px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  divider: {
    height: "1px",
    background: "rgba(250,204,21,0.35)",
    margin: "16px 0",
  },

  tierBar: {
    marginTop: "16px",
    borderRadius: "13px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textTransform: "uppercase",
    fontWeight: 950,
    background: "linear-gradient(135deg, #4c1d95, #9333ea)",
    color: "#faf5ff",
  },

  leaderStack: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  leaderBadge: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "9px",
    padding: "12px",
    color: "#facc15",
    fontWeight: 950,
  },

  scoutingBox: {
    background: "rgba(8,8,8,0.95)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "18px",
    padding: "22px",
    minHeight: "150px",
  },

  scoutingTitle: {
    margin: "0 0 18px",
    fontSize: "30px",
  },

  scoutingText: {
    color: "#cbd5e1",
    lineHeight: 1.55,
    margin: 0,
  },

  summaryBox: {
    background: "rgba(8,8,8,0.96)",
    color: "#f8e08e",
    border: "1px solid rgba(250,204,21,0.75)",
    borderRadius: "18px",
    padding: "22px",
    lineHeight: 1.55,
    fontWeight: 500,
    boxShadow: "0 0 24px rgba(250,204,21,0.08)",
    minHeight: "210px",
  },

  summaryTitle: {
    margin: "0 0 18px",
    color: "#f8e08e",
    fontSize: "30px",
  },

  muted: {
    color: "#94a3b8",
  },

  errorBox: {
    marginTop: "30px",
    border: "1px solid rgba(250,204,21,0.35)",
    borderRadius: "18px",
    padding: "24px",
    background: "rgba(8,8,8,0.95)",
  },
};