import Link from "next/link";
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

    winPct?: {
      value: number | null;
      grade: string;
    };

    styleAndRole?: {
      comp?: string;
      role?: string;
      fit?: string;
    };
  };
};

function formatValue(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined) return "—";
  return `${value}${suffix}`;
}

function getTierClass(tier: string | null | undefined) {
  const normalizedTier = tier?.trim().toUpperCase() || "PENDING";

  if (normalizedTier.startsWith("S")) return "tierBadge tierS";
  if (normalizedTier.startsWith("A")) return "tierBadge tierA";
  if (normalizedTier.startsWith("B")) return "tierBadge tierB";
  if (normalizedTier.startsWith("C")) return "tierBadge tierC";
  if (normalizedTier.startsWith("D")) return "tierBadge tierD";
  if (normalizedTier.startsWith("F")) return "tierBadge tierF";

  return "tierBadge tierPending";
}

export default async function PlayersPage() {
  const { data: players, error: playersError } = await supabaseAdmin
    .from("players")
    .select("id, player_name, display_name, created_at")
    .order("created_at", { ascending: false });

  if (playersError) {
    return (
      <main className="page">
        <style>{pageCss}</style>
        <h1 className="title">Players</h1>
        <p className="error">Could not load players: {playersError.message}</p>
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
      <main className="page">
        <style>{pageCss}</style>
        <h1 className="title">Players</h1>
        <p className="error">Could not load player cards: {cardsError.message}</p>
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
    <main className="page">
      <style>{pageCss}</style>

      <header className="header">
        <div>
          <Link href="/" className="logo">
            The Association
          </Link>

          <h1 className="title">Live Player Roster</h1>

          <p className="subtitle">
            Every saved player card in the database.
          </p>
        </div>

        <Link href="/submit-player" className="submitButton">
          Submit Player
        </Link>
      </header>

      <section className="grid">
        {playerRows.map((player) => {
          const card = latestCardByPlayer.get(player.id);
          const profile = card?.profile_json;

          const tier = profile?.tier || card?.tier || "Pending";
          const displayName = player.display_name || player.player_name;
          const topBadges = (profile?.badges ?? []).slice(0, 2);

          return (
            <Link
              key={player.id}
              href={`/player/${encodeURIComponent(player.player_name)}`}
              className="card"
            >
              <div className="cardTop">
                <h2 className="playerName">{displayName}</h2>
                <div className={getTierClass(tier)}>{tier}</div>
              </div>

              <div className="statMiniGrid">
                <div className="miniStat">
                  <span>PPG</span>
                  <strong>{formatValue(profile?.perGame?.ppg?.value)}</strong>
                </div>

                <div className="miniStat">
                  <span>APG</span>
                  <strong>{formatValue(profile?.perGame?.apg?.value)}</strong>
                </div>

                <div className="miniStat">
                  <span>RPG</span>
                  <strong>{formatValue(profile?.perGame?.rpg?.value)}</strong>
                </div>

                <div className="miniStat">
                  <span>WIN</span>
                  <strong>{formatValue(profile?.winPct?.value, "%")}</strong>
                </div>
              </div>

              <div className="badgeList">
                {topBadges.map((badge) => (
                  <div
                    key={`${badge.name}-${badge.description}`}
                    className="badgeLine"
                  >
                    <span className="badgeIcon">{badge.icon}</span>
                    <span>{badge.name}</span>
                  </div>
                ))}

                {topBadges.length === 0 && (
                  <div className="noBadges">No badges yet</div>
                )}
              </div>

              <div className="roleLine">
                {profile?.styleAndRole?.role ?? "Profile Ready"}
              </div>

              <div className="openText">Open Profile →</div>
            </Link>
          );
        })}
      </section>

      {playerRows.length === 0 && (
        <div className="empty">No players saved yet. Upload one first.</div>
      )}
    </main>
  );
}

const pageCss = `
  * {
    box-sizing: border-box;
  }

  .page {
    min-height: 100vh;
    background: radial-gradient(circle at top, #202020 0%, #050505 45%, #000 100%);
    color: white;
    padding: 32px;
    font-family: Arial, Helvetica, sans-serif;
    overflow-x: hidden;
  }

  .header {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: flex-start;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .logo {
    display: inline-block;
    color: white;
    text-decoration: none;
    font-size: 34px;
    font-weight: 950;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }

  .title {
    font-size: 44px;
    margin: 10px 0 8px;
    color: #facc15;
  }

  .subtitle {
    color: #cbd5e1;
    max-width: 720px;
    line-height: 1.5;
  }

  .submitButton {
    border: 1px solid rgba(250,204,21,0.7);
    color: #facc15;
    text-decoration: none;
    padding: 12px 18px;
    border-radius: 12px;
    font-weight: 950;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 320px));
    gap: 18px;
    justify-content: start;
  }

  .card {
    background: linear-gradient(180deg, rgba(18,18,18,0.98), rgba(7,7,7,0.98));
    border: 1px solid rgba(255,255,255,0.16);
    border-radius: 18px;
    padding: 18px;
    width: 100%;
    max-width: 320px;
    min-height: 300px;
    color: white;
    text-decoration: none;
    box-shadow: 0 0 24px rgba(250,204,21,0.05);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .cardTop {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .playerName {
    margin: 0;
    font-size: 22px;
    letter-spacing: -0.5px;
    word-break: break-word;
    line-height: 1.1;
  }

  .tierBadge {
    min-width: 46px;
    height: 46px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 950;
    border: 1px solid rgba(255,255,255,0.18);
    flex-shrink: 0;
  }

  .tierS {
    background: linear-gradient(135deg, #4c1d95, #9333ea);
    color: #faf5ff;
    box-shadow: 0 0 18px rgba(147,51,234,0.45);
  }

  .tierA {
    background: linear-gradient(135deg, #064e3b, #22c55e);
    color: #ecfdf5;
    box-shadow: 0 0 16px rgba(34,197,94,0.28);
  }

  .tierB {
    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
    color: #eff6ff;
    box-shadow: 0 0 16px rgba(59,130,246,0.25);
  }

  .tierC {
    background: linear-gradient(135deg, #ca8a04, #facc15);
    color: #1c1917;
    box-shadow: 0 0 16px rgba(250,204,21,0.3);
  }

  .tierD {
    background: linear-gradient(135deg, #7c2d12, #f97316);
    color: #fff7ed;
    box-shadow: 0 0 16px rgba(249,115,22,0.25);
  }

  .tierF {
    background: linear-gradient(135deg, #450a0a, #dc2626);
    color: #fef2f2;
    box-shadow: 0 0 16px rgba(220,38,38,0.28);
  }

  .tierPending {
    background: linear-gradient(135deg, #27272a, #52525b);
    color: #f4f4f5;
    font-size: 11px;
  }

  .statMiniGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .miniStat {
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 9px;
    background: rgba(255,255,255,0.045);
  }

  .miniStat span {
    display: block;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 1px;
  }

  .miniStat strong {
    display: block;
    margin-top: 4px;
    color: white;
    font-size: 17px;
    font-weight: 950;
  }

  .badgeList {
    display: flex;
    flex-direction: column;
    gap: 7px;
    font-family: monospace;
    font-size: 13px;
    font-weight: 900;
  }

  .badgeLine {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .badgeIcon {
    width: 20px;
    display: inline-block;
    text-align: center;
    flex-shrink: 0;
  }

  .noBadges {
    color: #94a3b8;
    font-family: monospace;
    font-size: 13px;
  }

  .roleLine {
    margin-top: auto;
    color: #f8e08e;
    font-size: 12px;
    line-height: 1.25;
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  .openText {
    color: #facc15;
    font-weight: 950;
    font-family: monospace;
    font-size: 13px;
  }

  .empty {
    margin-top: 30px;
    color: #aaa;
    border: 1px dashed rgba(250,204,21,0.4);
    border-radius: 16px;
    padding: 20px;
  }

  .error {
    color: #f87171;
  }

  @media (max-width: 700px) {
    .page {
      padding: max(18px, env(safe-area-inset-top)) 12px 24px;
    }

    .header {
      gap: 12px;
      margin-bottom: 22px;
    }

    .logo {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .title {
      font-size: 34px;
      margin: 8px 0 4px;
      line-height: 1;
    }

    .subtitle {
      display: none;
    }

    .submitButton {
      padding: 9px 10px;
      font-size: 11px;
      border-radius: 10px;
    }

    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      width: 100%;
    }

    .card {
      max-width: none;
      min-height: 230px;
      padding: 11px;
      border-radius: 14px;
      gap: 10px;
      box-shadow: 0 0 18px rgba(250,204,21,0.035);
    }

    .cardTop {
      gap: 8px;
    }

    .playerName {
      font-size: 13px;
      min-height: 30px;
      max-height: 46px;
      overflow: hidden;
    }

    .tierBadge {
      min-width: 38px;
      width: 38px;
      height: 36px;
      border-radius: 10px;
      font-size: 14px;
    }

    .tierPending {
      font-size: 8px;
    }

    .statMiniGrid {
      gap: 6px;
    }

    .miniStat {
      padding: 7px;
      border-radius: 9px;
    }

    .miniStat span {
      font-size: 8px;
    }

    .miniStat strong {
      font-size: 13px;
    }

    .badgeList {
      font-size: 10px;
      gap: 5px;
    }

    .badgeIcon {
      width: 16px;
    }

    .roleLine {
      font-size: 10px;
      max-height: 28px;
      overflow: hidden;
    }

    .openText {
      font-size: 10px;
    }
  }
`;