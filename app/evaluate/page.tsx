import Link from "next/link";
import PlayerEvaluator from "@/components/PlayerEvaluator";

export default function EvaluatePage() {
  return (
    <main className="container">
      <nav className="nav">
        <Link className="logo" href="/"><span className="logoMark">A</span> THE ASSOCIATION</Link>
        <Link className="btn secondary" href="/">Home</Link>
      </nav>
      <PlayerEvaluator />
      <footer className="footer">The difference will be clear.</footer>
    </main>
  );
}
