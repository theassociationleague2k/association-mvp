"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { evaluatePlayer, PlayerInput } from "@/lib/evaluation";

const emptyInput: PlayerInput = {
  name: "",
  games: 0,
  points: 0,
  rebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,
  fouls: 0,
  fgPct: 0,
  threePct: 0,
  ftPct: 0,
  winPct: 0,
};

type ReadStatus = "waiting" | "reading" | "ready" | "error";
type EvaluationResult = ReturnType<typeof evaluatePlayer>;

function buildStrengths(evaluation: EvaluationResult) {
  const strengths: string[] = [];

  if (["A+", "A", "A-"].includes(evaluation.grades.scoring)) {
    strengths.push(
      `Elite scoring profile: ${evaluation.perGame.ppg} PPG with a ${evaluation.grades.scoring} scoring grade.`
    );
  }

  if (["A+", "A", "A-"].includes(evaluation.grades.playmaking)) {
    strengths.push(
      `High-level creation: ${evaluation.perGame.apg} APG with a ${evaluation.grades.playmaking} playmaking grade.`
    );
  }

  if (["A+", "A", "A-"].includes(evaluation.grades.astTo)) {
    strengths.push(
      `Strong possession control: ${evaluation.advanced.astTo} assist-to-turnover ratio.`
    );
  }

  if (["A+", "A", "A-"].includes(evaluation.advanced.efficiencyComposite)) {
    strengths.push(
      `Elite shooting foundation: ${evaluation.input.fgPct}% FG and ${evaluation.input.threePct}% from three.`
    );
  }

  if (["A+", "A", "A-"].includes(evaluation.grades.winning)) {
    strengths.push(
      `Winning impact: ${evaluation.input.winPct}% win rate with a ${evaluation.grades.winning} winning grade.`
    );
  }

  if (evaluation.badges.length > 0) {
    strengths.push(
      `Badge profile supports the evaluation: ${evaluation.badges.slice(0, 4).join(", ")}.`
    );
  }

  return strengths.length
    ? strengths
    : ["No clear elite strengths yet, but the profile still has usable contribution areas."];
}

function buildWeaknesses(evaluation: EvaluationResult) {
  const weaknesses: string[] = [];

  if (["D+", "D", "F"].includes(evaluation.grades.rebounding)) {
    weaknesses.push(
      `Limited rebounding impact: ${evaluation.perGame.rpg} RPG with a ${evaluation.grades.rebounding} rebounding grade.`
    );
  }

  if (["D+", "D", "F"].includes(evaluation.grades.steals)) {
    weaknesses.push(
      `Low defensive disruption: ${evaluation.perGame.spg} steals per game.`
    );
  }

  if (["D+", "D", "F"].includes(evaluation.grades.blocks)) {
    weaknesses.push(
      `Limited rim protection: ${evaluation.perGame.bpg} blocks per game.`
    );
  }

  if (["D+", "D", "F"].includes(evaluation.grades.astTo)) {
    weaknesses.push(
      `Possession concern: ${evaluation.advanced.astTo} assist-to-turnover ratio.`
    );
  }

  if (["D+", "D", "F"].includes(evaluation.grades.ft)) {
    weaknesses.push(
      `Free throw weakness: ${evaluation.input.ftPct}% at the line.`
    );
  }

  return weaknesses.length
    ? weaknesses
    : ["No major core weakness is dragging the profile down."];
}

function buildScoutingSummary(evaluation: EvaluationResult) {
  return `${evaluation.input.name} profiles as a ${evaluation.role}. The production points toward a ${evaluation.tier.tierName} level player with a True Contribution score of ${evaluation.trueContribution.score}/100. The main value comes from ${evaluation.advanced.reads.efficiencyComposite.toLowerCase()}, ${evaluation.advanced.reads.fastbreakCreationAverage.toLowerCase()}, and a ${evaluation.winningTag.toLowerCase()} winning profile.`;
}

export default function PlayerEvaluator() {
  const [input, setInput] = useState<PlayerInput>(emptyInput);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ReadStatus>("waiting");
  const [errorMessage, setErrorMessage] = useState("");
const [demoMode, setDemoMode] = useState(false);
const [demoReason, setDemoReason] = useState("");
  const hasStartedReading = useRef(false);

  const evaluation = useMemo(() => {
    if (!input.name || input.games <= 0) return null;
    return evaluatePlayer(input);
  }, [input]);

  useEffect(() => {
    if (hasStartedReading.current) return;

    const savedImage = sessionStorage.getItem("association_uploaded_card");

    if (!savedImage) {
      setStatus("waiting");
      return;
    }

    hasStartedReading.current = true;
    setImageDataUrl(savedImage);
    readCard(savedImage);
  }, []);

  async function readCard(cardImage: string) {
    try {
      setStatus("reading");
      setErrorMessage("");

      const response = await fetch("/api/read-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageDataUrl: cardImage,
        }),
      });
const data = await response.json();
setDemoMode(Boolean(data.demoMode));
setDemoReason(data.demoReason || "");
    if (!response.ok) {
  const details =
    typeof data.details === "string"
      ? data.details
      : JSON.stringify(data.details ?? data, null, 2);

  throw new Error(
    [data.error || "The card could not be read.", details]
      .filter(Boolean)
      .join("\n\n")
  );
}

      const stats = data.stats as PlayerInput;

      setInput({
        ...emptyInput,
        ...stats,
      });

      setStatus("ready");
    } catch (error) {
console.warn("Card reader error:", error);      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while reading the card."
      );
    }
  }
  async function fileToJpegDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1400;
          const scale = Math.min(1, maxWidth / image.width);

          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Could not prepare uploaded image."));
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL("image/jpeg", 0.9));
        };

        image.onerror = () => {
          reject(
            new Error(
              "Could not load uploaded image. Try a screenshot saved as JPG or PNG."
            )
          );
        };

        image.src = String(reader.result);
      };

      reader.onerror = () => {
        reject(new Error("Could not read uploaded file."));
      };

      reader.readAsDataURL(file);
    });
  }
    async function onImageChange(file?: File) {
    if (!file) return;

    try {
      setStatus("reading");
      setErrorMessage("");

      const result = await fileToJpegDataUrl(file);

      sessionStorage.setItem("association_uploaded_card", result);
      setImageDataUrl(result);
      hasStartedReading.current = true;
      readCard(result);
    } catch (error) {
      console.warn("Image conversion error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not prepare uploaded image."
      );
    }
  }

  function resetCard() {
    sessionStorage.removeItem("association_uploaded_card");
    setInput(emptyInput);
    setImageDataUrl(null);
    setStatus("waiting");
    setErrorMessage("");
setDemoMode(false);
setDemoReason("");
    hasStartedReading.current = false;
  }

  return (
    <div>
      <div className="formCard">
        <h2>Player card reader</h2>

        {status === "waiting" && (
          <p>
            Upload a 2K player card screenshot. The Association will read the
            card and generate the evaluation automatically. No manual stat entry.
            Civilization advances by one inch.
          </p>
        )}

        {status === "reading" && (
          <p>
            Reading the player card and extracting the numbers. Give the machine
            a second to squint at the screenshot like it pays rent here.
          </p>
        )}

 {status === "ready" && (
  <p>
    {demoMode
      ? "Demo fallback loaded. The evaluation below is using saved GoodKarmaa stats until OpenAI billing/quota is active."
      : "Card read successfully. The evaluation below was generated from the uploaded player card."}
  </p>
)}

        {status === "error" && (
          <p>
            The card reader hit an error. Upload the card again or use a clearer
            screenshot.
          </p>
        )}

        <div className="formGrid">
          <div className="field full">
            <label>Upload player card</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageChange(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="buttonRow">
          <button className="btn secondary" onClick={resetCard}>
            Reset card
          </button>
        </div>

        {errorMessage && (
          <div className="card" style={{ marginTop: 16 }}>
            <h3>Reader error</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{errorMessage}</p>
          </div>
        )}
      </div>
      {demoMode && (
        <div className="resultCard" style={{ marginTop: 16 }}>
          <h3>Demo Mode Active</h3>
          <p>
            OpenAI quota or billing is currently blocking live card reading, so
            this evaluation is using saved GoodKarmaa demo stats.
          </p>
          {demoReason && <p>{demoReason}</p>}
        </div>
      )}
      {imageDataUrl && (
        <div className="resultCard" style={{ marginTop: 16 }}>
          <h3>Uploaded card preview</h3>
          <img
            className="preview"
            src={imageDataUrl}
            alt="Uploaded 2K card preview"
          />
        </div>
      )}

      {status === "reading" && (
        <div className="resultCard" style={{ marginTop: 16 }}>
          <h3>Generating evaluation...</h3>
          <p>
            The Association is reading the card, extracting the totals, and
            preparing the scouting report.
          </p>
        </div>
      )}
      {evaluation && (
        <div className="resultCard" style={{ marginTop: 16 }}>
          <div className="resultHeader">
            <div>
              <div className="kicker">Association Scouting Report</div>
              <h2>{evaluation.input.name}</h2>
              <p>
                {evaluation.role} · Tier {evaluation.tier.tier} ·{" "}
                {evaluation.tier.tierName}
              </p>
            </div>

            <div>
              <div className="small">Impact Read</div>
              <div className="metricBig">{evaluation.trueContribution.score}</div>
              <div className="pill">True Contribution</div>
            </div>
          </div>

          <section className="twoCol">
            <div className="card">
              <h3>Strengths</h3>
              <ul>
                {buildStrengths(evaluation).map((strength) => (
                  <li key={strength}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3>Weaknesses</h3>
              <ul>
                {buildWeaknesses(evaluation).map((weakness) => (
                  <li key={weakness}>{weakness}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
          <section className="card" style={{ marginTop: 16 }}>
            <h3>Player Comparison</h3>
            <p>
              <strong>{evaluation.playerComparison.name}</strong>
            </p>
            <p>{evaluation.playerComparison.reasoning}</p>
          </section>
            <h3>Final Scouting Summary</h3>
            <p>{buildScoutingSummary(evaluation)}</p>
          </section>
        </div>
      )}
      {evaluation && (
        <div className="resultCard" style={{ marginTop: 16 }}>
          <div className="resultHeader">
            <div>
              <div className="kicker">Your Player Card</div>
              <h2>{evaluation.input.name}</h2>
              <p>
                <strong>{evaluation.role}</strong> · Tier {evaluation.tier.tier} ·{" "}
                {evaluation.tier.tierName} · {evaluation.winningTag}
              </p>
            </div>

            <div>
              <div className="small">True Contribution</div>
              <div className="metricBig">{evaluation.trueContribution.score}</div>
              <div className="pill">{evaluation.trueContribution.label}</div>
            </div>
          </div>

          <section className="twoCol">
            <div className="card">
              <h3>Career Production</h3>
              <table className="table">
                <tbody>
                  <tr>
                    <td>Games</td>
                    <td>{evaluation.input.games}</td>
                  </tr>
                  <tr>
                    <td>Points</td>
                    <td>{evaluation.input.points}</td>
                  </tr>
                  <tr>
                    <td>Rebounds</td>
                    <td>{evaluation.input.rebounds}</td>
                  </tr>
                  <tr>
                    <td>Assists</td>
                    <td>{evaluation.input.assists}</td>
                  </tr>
                  <tr>
                    <td>Steals</td>
                    <td>{evaluation.input.steals}</td>
                  </tr>
                  <tr>
                    <td>Blocks</td>
                    <td>{evaluation.input.blocks}</td>
                  </tr>
                  <tr>
                    <td>Turnovers</td>
                    <td>{evaluation.input.turnovers}</td>
                  </tr>
                  <tr>
                    <td>Fouls</td>
                    <td>{evaluation.input.fouls}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>Per-game Profile</h3>
              <table className="table">
                <tbody>
                  <tr>
                    <td>PPG</td>
                    <td>{evaluation.perGame.ppg}</td>
                    <td>{evaluation.grades.scoring}</td>
                  </tr>
                  <tr>
                    <td>RPG</td>
                    <td>{evaluation.perGame.rpg}</td>
                    <td>{evaluation.grades.rebounding}</td>
                  </tr>
                  <tr>
                    <td>APG</td>
                    <td>{evaluation.perGame.apg}</td>
                    <td>{evaluation.grades.playmaking}</td>
                  </tr>
                  <tr>
                    <td>SPG</td>
                    <td>{evaluation.perGame.spg}</td>
                    <td>{evaluation.grades.steals}</td>
                  </tr>
                  <tr>
                    <td>BPG</td>
                    <td>{evaluation.perGame.bpg}</td>
                    <td>{evaluation.grades.blocks}</td>
                  </tr>
                  <tr>
                    <td>TOPG</td>
                    <td>{evaluation.perGame.topg}</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>AST/TO</td>
                    <td>{evaluation.advanced.astTo}</td>
                    <td>{evaluation.grades.astTo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="twoCol">
            <div className="card">
              <h3>Shooting and Winning</h3>
              <table className="table">
                <tbody>
                  <tr>
                    <td>FG%</td>
                    <td>{evaluation.input.fgPct}%</td>
                    <td>{evaluation.grades.fg}</td>
                  </tr>
                  <tr>
                    <td>3PT%</td>
                    <td>{evaluation.input.threePct}%</td>
                    <td>{evaluation.grades.three}</td>
                  </tr>
                  <tr>
                    <td>FT%</td>
                    <td>{evaluation.input.ftPct}%</td>
                    <td>{evaluation.grades.ft}</td>
                  </tr>
                  <tr>
                    <td>Win%</td>
                    <td>{evaluation.input.winPct}%</td>
                    <td>{evaluation.grades.winning}</td>
                  </tr>
                  <tr>
                    <td>Efficiency Composite</td>
                    <td>{evaluation.advanced.efficiencyComposite}</td>
                    <td>{evaluation.advanced.reads.efficiencyComposite}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>Badges</h3>
              {evaluation.badges.length ? (
                <div className="badges">
                  {evaluation.badges.map((badge) => (
                    <span className="badge" key={badge}>
                      {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No earned badges yet. Tragic, but curable.</p>
              )}

              <h3 style={{ marginTop: 22 }}>Quick Scouting Read</h3>
              <p>
                You grade as a <strong>{evaluation.tier.tierName}</strong> with a{" "}
                <strong>{evaluation.role}</strong> identity. Your True
                Contribution is{" "}
                <strong>{evaluation.trueContribution.score}/100</strong>, driven
                by production, efficiency, possession discipline, and impact
                coverage.
              </p>
            </div>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h3>Advanced Offensive Profile</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Read</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Points per Assist</td>
                  <td>{evaluation.advanced.pointsPerAssist}</td>
                  <td>{evaluation.advanced.reads.pointsPerAssist}</td>
                </tr>
                <tr>
                  <td>Assist-to-Point Ratio</td>
                  <td>{evaluation.advanced.assistToPointRatio}</td>
                  <td>{evaluation.advanced.reads.assistToPointRatio}</td>
                </tr>
                <tr>
                  <td>Fastbreak Creation Average</td>
                  <td>{evaluation.advanced.fastbreakCreationAverage}</td>
                  <td>{evaluation.advanced.reads.fastbreakCreationAverage}</td>
                </tr>
                <tr>
                  <td>Steals-to-Foul Ratio</td>
                  <td>{evaluation.advanced.stealsToFoulRatio}</td>
                  <td>{evaluation.advanced.reads.stealsToFoulRatio}</td>
                </tr>
                <tr>
                  <td>Efficiency Composite</td>
                  <td>{evaluation.advanced.efficiencyComposite}</td>
                  <td>{evaluation.advanced.reads.efficiencyComposite}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h3>True Contribution Breakdown</h3>
            <table className="table">
              <tbody>
                <tr>
                  <td>Base Impact</td>
                  <td>{evaluation.trueContribution.baseImpact}</td>
                </tr>
                <tr>
                  <td>Shooting Modifier</td>
                  <td>{evaluation.trueContribution.shootingModifier}</td>
                </tr>
                <tr>
                  <td>Win Modifier</td>
                  <td>{evaluation.trueContribution.winModifier}</td>
                </tr>
                <tr>
                  <td>Ball Security Modifier</td>
                  <td>{evaluation.trueContribution.ballSecurityModifier}</td>
                </tr>
                <tr>
                  <td>Impact Coverage Modifier</td>
                  <td>{evaluation.trueContribution.impactCoverageModifier}</td>
                </tr>
                <tr>
                  <td>Weakness Modifier</td>
                  <td>{evaluation.trueContribution.weaknessModifier}</td>
                </tr>
                <tr>
                  <td>Impact Categories Above Average</td>
                  <td>{evaluation.trueContribution.impactCoverageCount}</td>
                </tr>
                <tr>
                  <td>Core Weakness Count</td>
                  <td>{evaluation.trueContribution.coreWeaknessCount}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}