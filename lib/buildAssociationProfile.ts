import type { Evaluation } from "@/lib/evaluation";

type GradeValue = string;

type AssociationBadge = {
  name: string;
  description: string;
  icon: string;
};

function statBlock(value: number | null | undefined, grade: GradeValue = "N/A") {
  return {
    value: typeof value === "number" && Number.isFinite(value) ? value : null,
    grade,
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function getGrade(grades: Record<string, string> | undefined, key: string) {
  return grades?.[key] ?? "N/A";
}

function isGradeAtLeast(grade: string | undefined, minimum: "A" | "B") {
  if (!grade) return false;

  const normalized = grade.trim().toUpperCase();

  if (minimum === "A") {
    return normalized.startsWith("A") || normalized.startsWith("S");
  }

  return (
    normalized.startsWith("B") ||
    normalized.startsWith("A") ||
    normalized.startsWith("S")
  );
}

function isDGrade(grade: string | undefined) {
  return grade?.trim().toUpperCase().startsWith("D") ?? false;
}

function isFGrade(grade: string | undefined) {
  return grade?.trim().toUpperCase().startsWith("F") ?? false;
}

function addBadge(
  badges: AssociationBadge[],
  name: string,
  description: string,
  icon: string
) {
  if (badges.some((badge) => badge.name === name)) return;

  badges.push({
    name,
    description,
    icon,
  });
}

function buildFallbackComparison(evaluation: Evaluation) {
  const input = evaluation.input;
  const perGame = evaluation.perGame;

  const ppg = round1(perGame.ppg);
  const apg = round1(perGame.apg);
  const rpg = round1(perGame.rpg);
  const spg = round1(perGame.spg);
  const bpg = round1(perGame.bpg);

  if (ppg >= 25 && apg >= 7 && input.fgPct >= 65 && input.threePct >= 65) {
    return {
      name: "LeBron James-style offensive engine with Stephen Curry-level shooting pressure",
      reasoning:
        "The profile blends elite scoring volume, high-level creation, and extreme shooting efficiency. The LeBron side reflects the all-around offensive command and playmaking load, while the Curry side reflects the shooting pressure created by elite three-point efficiency.",
    };
  }

  if (ppg >= 20 && apg >= 7) {
    return {
      name: "James Harden-style offensive engine",
      reasoning:
        "The profile is built around scoring pressure and assist creation. This player drives offense as a primary ball-handler, creates advantages for teammates, and carries a large share of the possession responsibility.",
    };
  }

  if (ppg >= 20 && input.threePct >= 65) {
    return {
      name: "Klay Thompson-style scoring shooter",
      reasoning:
        "The profile leans toward efficient shot-making and floor spacing. This player creates value by converting shots at a high level and forcing defenses to respect the jumper every possession.",
    };
  }

  if (apg >= 7) {
    return {
      name: "Chris Paul-style floor general",
      reasoning:
        "The profile is centered on playmaking, decision-making, and creating organized offense. This player’s value comes from setting the table, protecting possessions, and keeping teammates involved.",
    };
  }

  if (rpg >= 8 && bpg >= 1) {
    return {
      name: "Anthony Davis-style interior impact player",
      reasoning:
        "The profile shows strong rebounding with real rim protection. This player impacts the game through paint presence, board control, and defensive activity around the basket.",
    };
  }

  if (spg >= 1.5 && apg >= 5) {
    return {
      name: "Jrue Holiday-style two-way guard",
      reasoning:
        "The profile combines defensive disruption with useful playmaking. This player can pressure the ball, create turnovers, and still contribute as an offensive connector.",
    };
  }

  if (rpg >= 6) {
    return {
      name: "Draymond Green-style role connector",
      reasoning:
        "The profile brings value through non-scoring impact, especially rebounding, defense, and connective play. This player may not carry the scoring load, but still helps shape winning possessions.",
    };
  }

  if (input.ftPct < 65 || input.winPct < 45) {
    return {
      name: "Developing role player",
      reasoning:
        "The profile shows useful flashes, but the overall impact is limited by one or more major weaknesses. The player needs cleaner efficiency, stronger winning impact, or more complete production before earning a stronger comparison.",
    };
  }

  return {
    name: "Balanced role contributor",
    reasoning:
      "The profile shows a useful but still developing player type. This player contributes in specific areas, but does not yet show enough elite production, creation, or defensive impact to justify a star-level comparison.",
  };
}

function buildDetailedFit(evaluation: Evaluation) {
  const fallback = buildFallbackComparison(evaluation);

  const compName =
    evaluation.playerComparison?.name &&
    evaluation.playerComparison.name.trim().length > 0
      ? evaluation.playerComparison.name
      : fallback.name;

  const compReasoning =
    evaluation.playerComparison?.reasoning &&
    evaluation.playerComparison.reasoning.trim().length > 0
      ? evaluation.playerComparison.reasoning
      : fallback.reasoning;

  return `Player Comp: ${compName}. ${compReasoning}`;
}

function buildAssociationBadges(evaluation: Evaluation) {
  const input = evaluation.input;
  const perGame = evaluation.perGame;
  const grades = evaluation.grades as unknown as Record<string, string>;

  const games = input.games || 1;

  const ppg = round1(perGame.ppg);
  const rpg = round1(perGame.rpg);
  const apg = round1(perGame.apg);
  const spg = round1(perGame.spg);
  const bpg = round1(perGame.bpg);
  const topg = round1(input.turnovers / games);

  const astTo =
    input.turnovers > 0
      ? round1(input.assists / input.turnovers)
      : input.assists;

  const stocks = round1(spg + bpg);

  const scoringGrade = getGrade(grades, "scoring");
  const playmakingGrade = getGrade(grades, "playmaking");
  const reboundingGrade = getGrade(grades, "rebounding");
  const fgGrade = getGrade(grades, "fg");
  const threeGrade = getGrade(grades, "three");
  const ftGrade = getGrade(grades, "ft");

  const badges: AssociationBadge[] = [];

  // SCORING LADDER
  if (
    ppg >= 25 &&
    input.fgPct >= 70 &&
    input.threePct >= 70 &&
    input.ftPct >= 90
  ) {
    addBadge(
      badges,
      "WALKING BUCKET",
      "25+ PPG with 70%+ FG, 70%+ 3PT, and 90%+ FT",
      "🏀"
    );
  } else if (ppg >= 20 && input.fgPct >= 70 && input.threePct >= 60) {
    addBadge(
      badges,
      "BUCKET GETTER",
      "20+ PPG with 70%+ FG and 60%+ 3PT",
      "🪣"
    );
  }

  // THREE-POINT SHOOTING LADDER
  if (input.threePct >= 75) {
    addBadge(badges, "FLAMETHROWER", "75%+ 3PT", "🔥");
  } else if (input.threePct >= 65) {
    addBadge(badges, "SNIPER", "65%+ 3PT", "🎯");
  }

  // FREE THROW LADDER
  if (input.ftPct >= 90) {
    addBadge(badges, "MONEY AT THE LINE", "90%+ FT", "💵");
  } else if (input.ftPct < 65) {
    addBadge(badges, "FOUL ME", "Below 65% FT", "🧱");
  }

  // BAD SHOOTING
  if (input.fgPct <= 50 || input.threePct <= 50) {
    addBadge(badges, "BRICK LAYER", "50% or worse from FG or 3PT", "🧱");
  }

  // ASSIST CREATION LADDER
  if (apg >= 7) {
    addBadge(badges, "VISIONARY", "7+ APG", "👁️");
  } else if (apg >= 5) {
    addBadge(badges, "DIMER", "5+ APG", "🪙");
  }

  // BALL CONTROL LADDER
  if (astTo >= 3) {
    addBadge(badges, "FLOOR GENERAL", "3.0+ AST/TO", "🎖️");
  } else if (astTo < 1.5) {
    addBadge(badges, "RATTLED", "Below 1.5 AST/TO", "😵‍💫");
  }

  if (topg >= 3) {
    addBadge(badges, "TURNOVER MACHINE", "3.0+ TOV per game", "🎰");
  }

  // REBOUNDING LADDER
  if (rpg >= 8) {
    addBadge(badges, "BOARD MAN", "8+ RPG", "🪜");
  } else if (rpg >= 6) {
    addBadge(badges, "GLASS CLEANER", "6+ RPG", "🧼");
  }

  // STEALS LADDER
  if (spg >= 2) {
    addBadge(badges, "KLEPTO", "2.0+ SPG", "🥷");
  } else if (spg >= 1.5) {
    addBadge(badges, "PICKPOCKET", "1.5+ SPG", "🫳");
  } else if (spg < 0.5) {
    addBadge(badges, "CONE ALERT", "Under 0.5 SPG", "🚧");
  }

  // BLOCKS LADDER
  if (bpg >= 1.5) {
    addBadge(badges, "RIM GUARDIAN", "1.5+ BPG", "🛡️");
  } else if (bpg >= 1) {
    addBadge(badges, "REJECTER", "1.0+ BPG", "💥");
  }

  // WINNING
  if (input.winPct >= 65) {
    addBadge(badges, "WINNER", "65%+ WIN", "👑");
  }

  // OFFENSIVE ENGINE
  if (ppg >= 20 && apg >= 7) {
    addBadge(badges, "OFFENSIVE ENGINE", "20+ PPG and 7+ APG", "🚂");
  }

  const majorCategoryWins = [
    isGradeAtLeast(scoringGrade, "B"),
    isGradeAtLeast(reboundingGrade, "B"),
    isGradeAtLeast(playmakingGrade, "B"),
    spg >= 1.5,
  ].filter(Boolean).length;

  // VERSATILITY LADDER
  if (majorCategoryWins >= 4) {
    addBadge(
      badges,
      "COMPLETE PLAYER",
      "B or better in all 4 major categories",
      "🧩"
    );
  } else if (majorCategoryWins >= 3) {
    addBadge(
      badges,
      "STAT SHEET STUFFER",
      "B or better in 3+ major categories",
      "📊"
    );
  }

  const offenseB =
    isGradeAtLeast(scoringGrade, "B") ||
    isGradeAtLeast(playmakingGrade, "B");

  const offenseA =
    isGradeAtLeast(scoringGrade, "A") ||
    isGradeAtLeast(playmakingGrade, "A");

  const defenseB = stocks >= 2;
  const defenseA = stocks >= 3;

  // TWO-WAY LADDER
  if (offenseA && defenseA) {
    addBadge(
      badges,
      "TWO-WAY STAR",
      "A or better in offense and defensive/stocks impact",
      "🌟"
    );
  } else if (offenseB && defenseB) {
    addBadge(
      badges,
      "TWO-WAY",
      "B or better in offense and defensive/stocks impact",
      "⚔️"
    );
  }

  const offenseWeak =
    isDGrade(scoringGrade) ||
    isFGrade(scoringGrade) ||
    isDGrade(playmakingGrade) ||
    isFGrade(playmakingGrade);

  const defenseWeak = spg < 0.5 && bpg < 0.5;

  if ((offenseB && defenseWeak) || (defenseB && offenseWeak)) {
    addBadge(
      badges,
      "ONE-WAY",
      "B or better on one side, D/F on the other",
      "↔️"
    );
  }

  const efficiencyIsCOrWorse =
    fgGrade.startsWith("C") ||
    fgGrade.startsWith("D") ||
    fgGrade.startsWith("F") ||
    threeGrade.startsWith("C") ||
    threeGrade.startsWith("D") ||
    threeGrade.startsWith("F");

  if (ppg >= 15 && efficiencyIsCOrWorse) {
    addBadge(badges, "STAT PADDER", "15+ PPG with C or worse efficiency", "🧾");
  }

  const liabilityGrades = [
    scoringGrade,
    reboundingGrade,
    playmakingGrade,
    fgGrade,
    threeGrade,
    ftGrade,
  ];

  let dCount = liabilityGrades.filter(isDGrade).length;
  let fCount = liabilityGrades.filter(isFGrade).length;

  if (spg < 0.3) fCount += 1;
  else if (spg < 0.5) dCount += 1;

  if (topg >= 4) fCount += 1;
  else if (topg >= 3) dCount += 1;

  if (fCount >= 1 || dCount >= 2) {
    addBadge(
      badges,
      "LIABILITY",
      "F in one impact area, or D in two impact areas",
      "🚨"
    );
  }

  return badges;
}

function formatLeaderRanks(evaluation: Evaluation) {
  if (evaluation.tier?.tier === "S") {
    return ["#1 in PPG", "#1 in FG%", "#1 in 3PT%"];
  }

  return [];
}

export function buildAssociationProfile(
  evaluation: Evaluation,
  imageUrl: string,
  storagePath: string
) {
  const input = evaluation.input;
  const perGame = evaluation.perGame;
  const grades = evaluation.grades as unknown as Record<string, string>;

  const games = input.games || 1;
  const topg = round1(input.turnovers / games);

  return {
    playerName: input.name,

    badges: buildAssociationBadges(evaluation),

    styleAndRole: {
      comp:
        evaluation.playerComparison?.name ??
        buildFallbackComparison(evaluation).name,
      role: evaluation.role ?? "Role pending",
      fit: buildDetailedFit(evaluation),
    },

    perGame: {
      ppg: statBlock(round1(perGame.ppg), getGrade(grades, "scoring")),
      apg: statBlock(round1(perGame.apg), getGrade(grades, "playmaking")),
      rpg: statBlock(round1(perGame.rpg), getGrade(grades, "rebounding")),
      spg: statBlock(round1(perGame.spg), "C"),
      bpg: statBlock(round1(perGame.bpg), "B"),
      topg: statBlock(topg, "N/A"),
    },

    efficiency: {
      astToTurnover: statBlock(
        evaluation.advanced.astTo,
        getGrade(grades, "astTo")
      ),
      fgPct: statBlock(input.fgPct, getGrade(grades, "fg")),
      threePct: statBlock(input.threePct, getGrade(grades, "three")),
      ftPct: statBlock(input.ftPct, getGrade(grades, "ft")),
    },

    winPct: statBlock(input.winPct, getGrade(grades, "winning")),

    tier: evaluation.tier?.tier ?? "Pending",

    associationLeader: formatLeaderRanks(evaluation),

    scouting: {
      strengths: evaluation.strengths?.join(" ") || "Strengths pending.",
      weaknesses: evaluation.weaknesses?.join(" ") || "Weaknesses pending.",
      finalSummary:
        evaluation.scoutingSummary || "Final scouting summary pending.",
    },

    media: {
      uploadedCardUrl: imageUrl,
      storagePath,
    },
  };
}