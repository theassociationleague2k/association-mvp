import Link from "next/link";
import type { CSSProperties } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PlayerRow = {
  id: string;
  player_name: string;
  display_name: string | null;
  created_at: string;
};

type CardRow = {
  player_id: string;
  tier: string | null;
  created_at: string;
  profile_json: {
    playerName?: string;
    tier?: string;

    badges?: {
      name: string;
      description: string;
      icon: string;
    }[];

    perGame?: {
      ppg?: { value: number | null; grade: string };
      apg?: { value: number | null; grade: string };
      rpg?: { value: number | null; grade: string };
      spg?: { value: number | null; grade: string };
      bpg?: { value: number | null; grade: string };
      topg?: { value: number | null; grade: string };
    };

    efficiency?: {
      fgPct?: { value: number | null; grade: string };
      threePct?: { value: number | null; grade: string };
      ftPct?: { value: number | null; grade: string };
      astToTurnover?: { value: number | null; grade: string };
    };
  };
};

function formatValue(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${value}`;
}

function getTierBadgeStyle(tier: string | null | undefined): CSSProperties {
  const normalizedTier = tier?.trim().toUpperCase() || "PENDING";

  const base: CSSProperties = {
    minWidth: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    fontSize: "18px",
    fontWeight: 950,
    border: "1px solid rgba(255,255,255,0.18)",
  };

  if (normalizedTier.startsWith("S")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #4c1d95, #9333ea)",
      color: "#faf5ff",
      boxShadow: "0 0 18px rgba(147,51,234,0.45)",
    };
  }

  if (normalizedTier.startsWith("A")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #064e3b, #22c55e)",
      color: "#ecfdf5",
      boxShadow: "0 0 16px rgba(34,197,94,0.28)",
    };
  }

  if (normalizedTier.startsWith("B")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      color: "#eff6ff",
      boxShadow: "0 0 16px rgba(59,130,246,0.25)",
    };
  }

  if (normalizedTier.startsWith("C")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #ca8a04, #facc15)",
      color: "#1c1917",
      boxShadow: "0 0 16px rgba(250,204,21,0.3)",
    };
  }

  if (normalizedTier.startsWith("D")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #7c2d12, #f97316)",
      color: "#fff7ed",
      boxShadow: "0 0 16px rgba(249,115,22,0.25)",
    };
  }

  if (normalizedTier.startsWith("F")) {
    return {
      ...base,
      background: "linear-gradient(135deg, #450a0a, #dc2626)",
      color: "#fef2f2",
      boxShadow: "0 0 16px rgba(220,38,38,0.28)",
    };
  }

  return {
    ...base,
    background: "linear-gradient(135deg, #27272a, #52525b)",
    color: "#f4f4f5",
    fontSize: "12px",
  };
}

export default async function PlayersPage() {
  const { data: players, error: playersError } = await supabaseAdmin
    .from("players")
    .select("id, player_name, display_name, created_at")
    .order("created_at", { ascending: false });

  if (playersError) {
    return (
      <main style={styles.page}>
        <h1 style={styles.title}>Players</h1>
        <p style={styles.error}>
          Could not load players: {playersError.message}
        </p>
      </main>
    );
  }

  const playerRows = (players ?? []) as PlayerRow[];
  const playerIds = playerRows.map((player) => player.id);

  const { data: cards, error: cardsError } = playerIds.length
    ? await supabaseAdmin
        .from("player_cards")
        .select("player_id, tier, created_at, profile_json")
        .in("player_id", playerIds)
        .order("created_at", { ascending: false })
    : { data: [] as CardRow[], error: null };

  if (cardsError) {
    return (
      <main style={styles.page}>
        <h1 style={styles.title}>Players</h1>
        <p style={styles.error}>
          Could not load player cards: {cardsError.message}
        </p>
      </main>
    );
  }

  const latestCardByPlayer = new Map<string, CardRow>();

  for (const card of (cards ?? []) as CardRow[]) {
    if (!latestCardByPlayer.has(card.player_id)) {
      latestCardByPlayer.set(card.player_id, card);
    }
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <Link href="/" style={styles.logo}>
            The Association
          </Link>

          <h1 style={styles.title}>Live Player Roster</h1>

          <p style={styles.subtitle}>
            Every saved player card in the database. New uploads should appear
            here after the card is successfully saved.
          </p>
        </div>

        <Link href="/submit-player" style={styles.submitButton}>
          Submit Player
        </Link>
      </header>

      <section style={styles.grid}>
        {playerRows.map((player) => {
          const card = latestCardByPlayer.get(player.id);
          const profile = card?.profile_json;

          const tier = profile?.tier || card?.tier || "Pending";

          return (
            <Link
              key={player.id}
              href={`/player/${encodeURIComponent(player.player_name)}`}
              style={styles.card}
            >
              <div>
                <div style={styles.cardTop}>
                  <h2 style={styles.playerName}>
                    {player.display_name || player.player_name}
                  </h2>

                  <div style={getTierBadgeStyle(tier)}>{tier}</div>
                </div>

                <div style={styles.badgeList}>
                  {(profile?.badges ?? []).slice(0, 5).map((badge) => (
                    <div
                      key={`${badge.name}-${badge.description}`}
                      style={styles.badgeLine}
                    >
                      <span style={styles.badgeIcon}>{badge.icon}</span>
                      <span>{badge.name}</span>
                    </div>
                  ))}

                  {(profile?.badges ?? []).length === 0 && (
                    <div style={styles.noBadges}>No badges yet</div>
                  )}
                </div>

                <div style={styles.compactStats}>
                  <div style={styles.compactStatRow}>
                    <span>PPG {formatValue(profile?.perGame?.ppg?.value)}</span>
                    <span>APG {formatValue(profile?.perGame?.apg?.value)}</span>
                  </div>

                  <div style={styles.compactStatRow}>
                    <span>RPG {formatValue(profile?.perGame?.rpg?.value)}</span>
                    <span>SPG {formatValue(profile?.perGame?.spg?.value)}</span>
                  </div>

                  <div style={styles.compactStatRow}>
                    <span>
                      FG% {formatValue(profile?.efficiency?.fgPct?.value)}
                    </span>
                    <span>
                      3PT% {formatValue(profile?.efficiency?.threePct?.value)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.openText}>Open Profile →</div>
            </Link>
          );
        })}
      </section>

      {playerRows.length === 0 && (
        <div style={styles.empty}>
          No players saved yet. Upload one first.
        </div>
      )}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #202020 0%, #050505 45%, #000 100%)",
    color: "white",
    padding: "32px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  logo: {
    display: "inline-block",
    color: "white",
    textDecoration: "none",
    fontSize: "34px",
    fontWeight: 950,
    letterSpacing: "-1px",
    marginBottom: "8px",
  },

  title: {
    fontSize: "44px",
    margin: "10px 0 8px",
    color: "#facc15",
  },

  subtitle: {
    color: "#cbd5e1",
    maxWidth: "720px",
    lineHeight: 1.5,
  },

  submitButton: {
    border: "1px solid rgba(250,204,21,0.7)",
    color: "#facc15",
    textDecoration: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 320px))",
    gap: "18px",
    justifyContent: "start",
  },

  card: {
    background: "rgba(12,12,12,0.96)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "18px",
    padding: "20px",
    width: "100%",
    maxWidth: "320px",
    minHeight: "330px",
    color: "white",
    textDecoration: "none",
    boxShadow: "0 0 24px rgba(250,204,21,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "18px",
  },

  playerName: {
    margin: 0,
    fontSize: "22px",
    letterSpacing: "-0.5px",
    wordBreak: "break-word",
  },

  badgeList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "18px",
    fontFamily: "monospace",
    fontSize: "14px",
    fontWeight: 900,
  },

  badgeLine: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    whiteSpace: "normal",
  },

  badgeIcon: {
    width: "22px",
    display: "inline-block",
    textAlign: "center",
    flexShrink: 0,
  },

  noBadges: {
    color: "#94a3b8",
    fontFamily: "monospace",
    fontSize: "13px",
  },

  compactStats: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "18px",
    marginBottom: "18px",
    fontFamily: "monospace",
    fontSize: "14px",
    fontWeight: 900,
  },

  compactStatRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  openText: {
    marginTop: "18px",
    color: "#facc15",
    fontWeight: 950,
    fontFamily: "monospace",
  },

  empty: {
    marginTop: "30px",
    color: "#aaa",
    border: "1px dashed rgba(250,204,21,0.4)",
    borderRadius: "16px",
    padding: "20px",
  },

  error: {
    color: "#f87171",
  },
};