import Link from "next/link";
import type { CSSProperties } from "react";

export default function HomePage() {
  return (
    <main style={styles.page}>
      <div style={styles.stage}>
        <img
          src="/association-clean-homepage.png"
          alt="The Association homepage"
          style={styles.homeImage}
        />

        <Link
          href="/submit-player"
          aria-label="Upload Player"
          style={{
            ...styles.hotspot,
            top: "70%",
            left: "9%",
            width: "34%",
            height: "12%",
          }}
        />

        <Link
          href="/players"
          aria-label="Roster"
          style={{
            ...styles.hotspot,
            top: "70%",
            left: "43%",
            width: "26%",
            height: "12%",
          }}
        />

        <Link
          href="/"
          aria-label="About"
          style={{
            ...styles.hotspot,
            top: "70%",
            left: "69%",
            width: "24%",
            height: "12%",
          }}
        />
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    width: "100vw",
    height: "100vh",
    background: "#000000",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
  },

  stage: {
    position: "relative",
    width: "min(100vw, calc(100vh * 16 / 9))",
    aspectRatio: "16 / 9",
  },

  homeImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center center",
    userSelect: "none",
    pointerEvents: "none",
  },

  hotspot: {
    position: "absolute",
    zIndex: 10,
    display: "block",
    cursor: "pointer",
    background: "transparent",
    borderRadius: "10px",
  },
};