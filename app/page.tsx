import Link from "next/link";
import type { CSSProperties } from "react";

export default function HomePage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.logoMark}>A</div>

        <p style={styles.kicker}>NBA 2K REC SCOUTING DATABASE</p>

        <h1 style={styles.title}>THE ASSOCIATION</h1>

        <p style={styles.subtitle}>
          Upload player cards, generate scouting reports, assign badges, build
          live profiles, and grow the roster into a real competitive player
          database.
        </p>

        <div style={styles.actions}>
          <Link href="/submit-player" style={styles.primaryButton}>
            Upload Player Card
          </Link>

          <Link href="/players" style={styles.secondaryButton}>
            View Live Roster
          </Link>
        </div>

        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <span style={styles.featureNumber}>01</span>
            <h3 style={styles.featureTitle}>Card Reading</h3>
            <p style={styles.featureText}>
              Extracts stats from uploaded player cards and turns them into
              clean profile data.
            </p>
          </div>

          <div style={styles.featureCard}>
            <span style={styles.featureNumber}>02</span>
            <h3 style={styles.featureTitle}>Scouting Engine</h3>
            <p style={styles.featureText}>
              Grades scoring, playmaking, efficiency, defense, winning, and
              overall role.
            </p>
          </div>

          <div style={styles.featureCard}>
            <span style={styles.featureNumber}>03</span>
            <h3 style={styles.featureTitle}>Live Roster</h3>
            <p style={styles.featureText}>
              Saves every evaluated player into the Association database for
              public profiles.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #2a2205 0%, #090909 38%, #000 100%)",
    color: "white",
    fontFamily: "Arial, Helvetica, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "36px",
  },

  hero: {
    width: "100%",
    maxWidth: "1180px",
    minHeight: "760px",
    border: "1px solid rgba(250,204,21,0.35)",
    borderRadius: "32px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))",
    boxShadow: "0 0 80px rgba(250,204,21,0.08)",
    padding: "58px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },

  logoMark: {
    width: "92px",
    height: "92px",
    borderRadius: "28px",
    border: "2px solid rgba(250,204,21,0.85)",
    color: "#facc15",
    display: "grid",
    placeItems: "center",
    fontSize: "54px",
    fontWeight: 950,
    marginBottom: "26px",
    boxShadow: "0 0 38px rgba(250,204,21,0.2)",
  },

  kicker: {
    margin: 0,
    color: "#facc15",
    fontWeight: 950,
    letterSpacing: "3px",
    fontSize: "13px",
  },

  title: {
    margin: "14px 0 18px",
    color: "#facc15",
    fontSize: "82px",
    lineHeight: 0.95,
    letterSpacing: "-4px",
    fontWeight: 950,
    textShadow: "0 0 28px rgba(250,204,21,0.22)",
  },

  subtitle: {
    maxWidth: "760px",
    margin: "0 auto",
    color: "#d4d4d8",
    fontSize: "20px",
    lineHeight: 1.55,
    fontWeight: 600,
  },

  actions: {
    display: "flex",
    gap: "18px",
    marginTop: "36px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  primaryButton: {
    color: "#111",
    background: "#facc15",
    textDecoration: "none",
    padding: "17px 26px",
    borderRadius: "14px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxShadow: "0 0 28px rgba(250,204,21,0.25)",
  },

  secondaryButton: {
    color: "#facc15",
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(250,204,21,0.6)",
    textDecoration: "none",
    padding: "17px 26px",
    borderRadius: "14px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
    marginTop: "54px",
    width: "100%",
  },

  featureCard: {
    background: "rgba(0,0,0,0.38)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "24px",
    textAlign: "left",
  },

  featureNumber: {
    color: "#facc15",
    fontWeight: 950,
    fontSize: "13px",
    letterSpacing: "2px",
  },

  featureTitle: {
    margin: "12px 0 8px",
    fontSize: "21px",
    color: "white",
  },

  featureText: {
    margin: 0,
    color: "#a1a1aa",
    lineHeight: 1.45,
    fontSize: "14px",
    fontWeight: 600,
  },
};