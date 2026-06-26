"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";

type ExtractedStats = {
  name: string;
  games: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  winPct: number;
};

type UploadResult = {
  success: boolean;
  message?: string;
  error?: string;
  player?: {
    id: string;
    player_name: string;
  };
  card?: {
    id: string;
    image_url: string;
    storage_path: string;
    profile_json: {
      playerName?: string;
      tier?: string;
      styleAndRole?: {
        comp?: string;
        role?: string;
        fit?: string;
      };
    };
    created_at: string;
  };
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read file."));
      }
    };

    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function formatStat(value: number | undefined | null, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value}${suffix}`;
}

function StatBox({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number | undefined;
  suffix?: string;
}) {
  return (
    <div style={styles.statBox}>
      <span style={styles.statLabel}>{label}</span>
      <strong style={styles.statValue}>{formatStat(value, suffix)}</strong>
    </div>
  );
}

export default function UploadTestPage() {
  const [manualPlayerName, setManualPlayerName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [extractedStats, setExtractedStats] = useState<ExtractedStats | null>(
    null
  );
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  async function handleUpload() {
    if (!file) {
      alert("Choose a player card image first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setExtractedStats(null);
    setStatusText("");

    try {
      setStatusText("Reading player card...");

      const imageDataUrl = await fileToDataUrl(file);

      const readResponse = await fetch("/api/read-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageDataUrl }),
      });

      const readData = await readResponse.json();

      if (!readResponse.ok || !readData.stats) {
        const details =
          typeof readData.details === "string"
            ? readData.details
            : JSON.stringify(readData.details ?? "", null, 2);

        throw new Error(
          `${readData.error || "Could not extract stats from this card."}${
            details ? `\n\nDetails:\n${details}` : ""
          }`
        );
      }

      const stats = readData.stats as ExtractedStats;
      setExtractedStats(stats);

      const finalPlayerName =
        stats.name?.trim() || manualPlayerName.trim() || "Unknown Player";

      setStatusText("Saving evaluated player profile...");

      const formData = new FormData();
      formData.append("playerName", finalPlayerName);
      formData.append("file", file);
      formData.append("statsJson", JSON.stringify(stats));

      const uploadResponse = await fetch("/api/upload-card", {
        method: "POST",
        body: formData,
      });

      const uploadData = (await uploadResponse.json()) as UploadResult;

      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.error || "Upload save failed.");
      }

      if (!uploadData.player?.player_name || !uploadData.card?.id) {
        throw new Error(
          "Upload returned success, but no saved player/card came back."
        );
      }

      setResult(uploadData);
      setStatusText("Saved.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown upload error.";

      setStatusText("Failed.");
      setResult({
        success: false,
        error: message,
      });
    } finally {
      setLoading(false);
    }
  }

  const profileUrl = result?.player?.player_name
    ? `/player/${encodeURIComponent(result.player.player_name)}`
    : null;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <Link href="/" style={styles.logo}>
            The Association
          </Link>

          <h1 style={styles.title}>Submit Player Card</h1>

          <p style={styles.subtitle}>
            Upload a 2K REC player card. The site reads the card, evaluates the
            player, saves the image, and creates a live profile.
          </p>
        </div>

        <Link href="/players" style={styles.rosterButton}>
          View Roster
        </Link>
      </header>

      <section style={styles.layout}>
        <section style={styles.uploadCard}>
          <label style={styles.label}>
            Player Name Fallback
            <input
              value={manualPlayerName}
              onChange={(event) => setManualPlayerName(event.target.value)}
              placeholder="Only used if card reader cannot find the name"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Player Card Image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null;
                setFile(selectedFile);
              }}
              style={styles.fileInput}
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              ...styles.uploadButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Working..." : "Upload + Evaluate"}
          </button>

          {statusText && <p style={styles.status}>{statusText}</p>}
        </section>
      </section>

      {extractedStats && (
        <section style={styles.resultsCard}>
          <div style={styles.resultsHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Extracted Stats</h2>
              <p style={styles.sectionSubtext}>
                Numbers read from the uploaded player card.
              </p>
            </div>

            <strong style={styles.playerName}>{extractedStats.name}</strong>
          </div>

          <div style={styles.statGrid}>
            <StatBox label="Games" value={extractedStats.games} />
            <StatBox label="Points" value={extractedStats.points} />
            <StatBox label="Rebounds" value={extractedStats.rebounds} />
            <StatBox label="Assists" value={extractedStats.assists} />
            <StatBox label="Steals" value={extractedStats.steals} />
            <StatBox label="Blocks" value={extractedStats.blocks} />
            <StatBox label="Turnovers" value={extractedStats.turnovers} />
            <StatBox label="Fouls" value={extractedStats.fouls} />
            <StatBox label="FG%" value={extractedStats.fgPct} suffix="%" />
            <StatBox label="3PT%" value={extractedStats.threePct} suffix="%" />
            <StatBox label="FT%" value={extractedStats.ftPct} suffix="%" />
            <StatBox label="WIN%" value={extractedStats.winPct} suffix="%" />
          </div>
        </section>
      )}

      {result && (
        <section
          style={{
            ...styles.finalCard,
            borderColor: result.success
              ? "rgba(34,197,94,0.65)"
              : "rgba(248,113,113,0.75)",
            background: result.success
              ? "rgba(6,78,59,0.18)"
              : "rgba(127,29,29,0.36)",
          }}
        >
          <h2 style={styles.finalTitle}>
            {result.success ? "Player Saved" : "Upload Failed"}
          </h2>

          {result.success ? (
            <>
              <p style={styles.finalText}>
                {result.message || "Player card was saved successfully."}
              </p>

              <div style={styles.savedDetails}>
                <div>
                  <span style={styles.smallLabel}>Player</span>
                  <strong>{result.player?.player_name ?? "Unknown"}</strong>
                </div>

                <div>
                  <span style={styles.smallLabel}>Tier</span>
                  <strong>{result.card?.profile_json?.tier ?? "Saved"}</strong>
                </div>
              </div>

              {result.card?.profile_json?.styleAndRole?.fit && (
                <div style={styles.compBox}>
                  <span style={styles.smallLabel}>Player Comparison</span>
                  <p style={styles.compText}>
                    {result.card.profile_json.styleAndRole.fit}
                  </p>
                </div>
              )}

              <div style={styles.actionRow}>
                {profileUrl && (
                  <Link href={profileUrl} style={styles.profileButton}>
                    Open Player Profile
                  </Link>
                )}

                <Link href="/players" style={styles.secondaryAction}>
                  View Roster
                </Link>
              </div>
            </>
          ) : (
            <pre style={styles.errorText}>
              {result.error || "Unknown upload failure."}
            </pre>
          )}
        </section>
      )}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #1b1b1b 0%, #060606 42%, #000 100%)",
    color: "white",
    padding: "max(24px, env(safe-area-inset-top)) clamp(16px, 4vw, 32px) 32px",
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },

  logo: {
    color: "white",
    textDecoration: "none",
    fontSize: "clamp(24px, 5vw, 38px)",
    fontWeight: 950,
    letterSpacing: "-1px",
  },

  title: {
    margin: "12px 0",
    color: "#facc15",
    fontSize: "clamp(36px, 9vw, 58px)",
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: 0,
    maxWidth: "820px",
    color: "#e5e7eb",
    lineHeight: 1.45,
    fontSize: "clamp(15px, 3.5vw, 18px)",
  },

  rosterButton: {
    color: "#facc15",
    border: "1px solid rgba(250,204,21,0.7)",
    textDecoration: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 520px)",
    gap: "24px",
    alignItems: "stretch",
    marginTop: "28px",
  },

  uploadCard: {
    width: "100%",
    maxWidth: "520px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(12,12,12,0.96)",
    borderRadius: "18px",
    padding: "clamp(18px, 4vw, 24px)",
    boxSizing: "border-box",
  },

  label: {
    display: "block",
    color: "white",
    fontWeight: 950,
    marginBottom: "18px",
  },

  input: {
    display: "block",
    width: "100%",
    marginTop: "10px",
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "12px",
    color: "white",
    padding: "14px",
    fontSize: "16px",
    boxSizing: "border-box",
  },

  fileInput: {
    display: "block",
    width: "100%",
    marginTop: "10px",
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "12px",
    color: "white",
    padding: "12px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  uploadButton: {
    width: "100%",
    background: "#facc15",
    color: "#111",
    border: "none",
    borderRadius: "14px",
    padding: "16px",
    fontWeight: 950,
    textTransform: "uppercase",
    fontSize: "16px",
    marginTop: "4px",
  },

  status: {
    margin: "18px 0 0",
    color: "#facc15",
    fontWeight: 950,
  },

  resultsCard: {
    marginTop: "26px",
    width: "100%",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(12,12,12,0.96)",
    borderRadius: "18px",
    padding: "clamp(18px, 4vw, 24px)",
    boxSizing: "border-box",
  },

  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    color: "#facc15",
    fontSize: "28px",
  },

  sectionSubtext: {
    margin: "8px 0 0",
    color: "#cbd5e1",
  },

  playerName: {
    color: "white",
    fontSize: "22px",
    wordBreak: "break-word",
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
  },

  statBox: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "14px",
    padding: "14px",
    background: "rgba(255,255,255,0.045)",
    minWidth: 0,
  },

  statLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  statValue: {
    display: "block",
    marginTop: "8px",
    color: "white",
    fontSize: "22px",
  },

  finalCard: {
    marginTop: "26px",
    width: "100%",
    maxWidth: "860px",
    border: "1px solid",
    borderRadius: "18px",
    padding: "clamp(18px, 4vw, 24px)",
    boxSizing: "border-box",
  },

  finalTitle: {
    margin: "0 0 14px",
    fontSize: "30px",
  },

  finalText: {
    margin: 0,
    color: "#e5e7eb",
    lineHeight: 1.45,
  },

  savedDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginTop: "18px",
  },

  smallLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "6px",
  },

  compBox: {
    marginTop: "18px",
    border: "1px solid rgba(250,204,21,0.28)",
    borderRadius: "14px",
    padding: "16px",
    background: "rgba(0,0,0,0.22)",
  },

  compText: {
    margin: 0,
    color: "#e5e7eb",
    lineHeight: 1.55,
    overflowWrap: "anywhere",
  },

  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "20px",
  },

  profileButton: {
    background: "#facc15",
    color: "#111",
    textDecoration: "none",
    borderRadius: "12px",
    padding: "13px 16px",
    fontWeight: 950,
    textTransform: "uppercase",
  },

  secondaryAction: {
    color: "#facc15",
    border: "1px solid rgba(250,204,21,0.55)",
    textDecoration: "none",
    borderRadius: "12px",
    padding: "13px 16px",
    fontWeight: 950,
    textTransform: "uppercase",
  },

  errorText: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    color: "#fecaca",
    margin: 0,
    lineHeight: 1.5,
    fontFamily: "monospace",
  },
};