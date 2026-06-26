"use client";

import { useState } from "react";

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

      setStatusText("Uploading and saving evaluated profile...");

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
        throw new Error(uploadData.error || "Upload failed.");
      }

      setResult(uploadData);
      setStatusText("Saved.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      setResult({
        success: false,
        error: message,
      });

      setStatusText("Failed.");
    } finally {
      setLoading(false);
    }
  }

  const profilePlayerName =
    result?.player?.player_name || extractedStats?.name || manualPlayerName;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.logo}>The Association</div>
          <h1 style={styles.title}>Submit Player Card</h1>
          <p style={styles.subtitle}>
            Upload a 2K REC player card. The site reads the card, evaluates the
            player, saves the image, and creates a live profile.
          </p>
        </div>

        <a href="/players" style={styles.navButton}>
          View Roster
        </a>
      </header>

      <section style={styles.panel}>
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
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            style={styles.fileInput}
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.65 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : "Upload + Evaluate"}
        </button>

        {statusText && <p style={styles.status}>{statusText}</p>}
      </section>

      {extractedStats && (
        <section style={styles.statsPanel}>
          <h2 style={styles.sectionTitle}>Extracted Stats</h2>

          <div style={styles.statsGrid}>
            <div>Player: {extractedStats.name}</div>
            <div>Games: {extractedStats.games}</div>
            <div>Points: {extractedStats.points}</div>
            <div>Assists: {extractedStats.assists}</div>
            <div>Rebounds: {extractedStats.rebounds}</div>
            <div>Steals: {extractedStats.steals}</div>
            <div>Blocks: {extractedStats.blocks}</div>
            <div>FG%: {extractedStats.fgPct}</div>
            <div>3PT%: {extractedStats.threePct}</div>
            <div>FT%: {extractedStats.ftPct}</div>
            <div>Win%: {extractedStats.winPct}</div>
          </div>
        </section>
      )}

      {result && (
        <section style={result.success ? styles.successBox : styles.errorBox}>
          <h2>{result.success ? "Saved Online" : "Upload Failed"}</h2>

          <p>{result.message || result.error}</p>

          {result.success && profilePlayerName && (
            <div style={styles.linkRow}>
              <a
                href={`/player/${encodeURIComponent(profilePlayerName)}`}
                style={styles.primaryLink}
              >
                Open Full Profile →
              </a>

              <a href="/players" style={styles.secondaryLink}>
                View Live Roster
              </a>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  },

  logo: {
    fontSize: "34px",
    fontWeight: 900,
    letterSpacing: "-1px",
  },

  title: {
    fontSize: "44px",
    margin: "10px 0 8px",
    color: "#facc15",
  },

  subtitle: {
    color: "#cbd5e1",
    maxWidth: "760px",
    lineHeight: 1.5,
  },

  navButton: {
    border: "1px solid rgba(250,204,21,0.7)",
    color: "#facc15",
    textDecoration: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
  },

  panel: {
    maxWidth: "520px",
    background: "rgba(12,12,12,0.96)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "18px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontWeight: 800,
    color: "#f8fafc",
  },

  input: {
    background: "#171717",
    color: "white",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "15px",
  },

  fileInput: {
    background: "#171717",
    color: "white",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "15px",
  },

  button: {
    background: "#facc15",
    color: "black",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "15px",
    fontWeight: 900,
    textTransform: "uppercase",
  },

  status: {
    color: "#facc15",
    fontWeight: 800,
    margin: 0,
  },

  statsPanel: {
    marginTop: "24px",
    maxWidth: "720px",
    background: "rgba(12,12,12,0.96)",
    border: "1px solid rgba(0,188,255,0.35)",
    borderRadius: "18px",
    padding: "22px",
  },

  sectionTitle: {
    marginTop: 0,
    color: "#38bdf8",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    fontFamily: "monospace",
    fontWeight: 800,
  },

  successBox: {
    marginTop: "24px",
    maxWidth: "720px",
    background: "rgba(6,78,59,0.35)",
    border: "1px solid rgba(34,197,94,0.6)",
    borderRadius: "18px",
    padding: "22px",
  },

  errorBox: {
    marginTop: "24px",
    maxWidth: "720px",
    background: "rgba(127,29,29,0.35)",
    border: "1px solid rgba(248,113,113,0.6)",
    borderRadius: "18px",
    padding: "22px",
  },

  linkRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "16px",
  },

  primaryLink: {
    background: "#facc15",
    color: "black",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 900,
  },

  secondaryLink: {
    border: "1px solid rgba(250,204,21,0.7)",
    color: "#facc15",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 900,
  },
};