import {
  AdvancedStats,
  ASSOCIATION_SCALE_VERSION,
  GradeSet,
  PlayerInput,
  calculateAdvanced,
  calculateGrades,
  calculatePerGame,
  getBadges,
  getRole,
  getTier,
  getTrueContribution,
  getWinningTag,
} from "./associationScale";

export type { PlayerInput };

export type Evaluation = {
  scaleVersion: string;
  input: PlayerInput;
  perGame: ReturnType<typeof calculatePerGame>;
  grades: GradeSet;
  advanced: AdvancedStats;
  tier: ReturnType<typeof getTier>;
  winningTag: string;
  badges: string[];
  role: string;
  trueContribution: ReturnType<typeof getTrueContribution>;
  strengths: string[];
  weaknesses: string[];
  scoutingSummary: string;
  playerComparison: {
    name: string;
    reasoning: string;
  };
};

function isStrongGrade(grade: string) {
  return ["A+", "A", "A-", "B+"].includes(grade);
}

function isEliteGrade(grade: string) {
  return ["A+", "A", "A-"].includes(grade);
}

function isWeakGrade(grade: string) {
  return ["D+", "D", "F"].includes(grade);
}

function buildStrengths(evaluation: {
  input: PlayerInput;
  perGame: ReturnType<typeof calculatePerGame>;
  grades: GradeSet;
  advanced: AdvancedStats;
  badges: string[];
  winningTag: string;
}) {
  const strengths: string[] = [];

  if (isEliteGrade(evaluation.grades.scoring)) {
    strengths.push(
      `Your scoring volume is a real engine piece: ${evaluation.perGame.ppg} PPG with a ${evaluation.grades.scoring} scoring grade.`
    );
  }

  if (isEliteGrade(evaluation.grades.playmaking)) {
    strengths.push(
      `Your creation is high-level: ${evaluation.perGame.apg} APG with a ${evaluation.grades.playmaking} playmaking grade.`
    );
  }

  if (isEliteGrade(evaluation.grades.astTo)) {
    strengths.push(
      `You protect possessions while creating offense: ${evaluation.advanced.astTo} AST/TO with a ${evaluation.grades.astTo} ball-security grade.`
    );
  }

  if (isEliteGrade(evaluation.advanced.efficiencyComposite)) {
    strengths.push(
      `Your efficiency is elite because both shooting splits hold up: ${evaluation.input.fgPct}% FG and ${evaluation.input.threePct}% from three.`
    );
  }

  if (isStrongGrade(evaluation.grades.winning)) {
    strengths.push(
      `Your winning profile supports the production: ${evaluation.input.winPct}% win rate and a ${evaluation.winningTag} tag.`
    );
  }

  if (evaluation.badges.length > 0) {
    strengths.push(
      `Your badge profile confirms the role: ${evaluation.badges.slice(0, 5).join(", ")}.`
    );
  }

  return strengths.length
    ? strengths
    : ["Your profile has usable contribution, but no single category clearly separates from the field yet."];
}

function buildWeaknesses(evaluation: {
  perGame: ReturnType<typeof calculatePerGame>;
  grades: GradeSet;
  input: PlayerInput;
}) {
  const weaknesses: string[] = [];

  if (isWeakGrade(evaluation.grades.rebounding)) {
    weaknesses.push(
      `Your rebounding is a real weak point: ${evaluation.perGame.rpg} RPG with a ${evaluation.grades.rebounding} grade.`
    );
  }

  if (isWeakGrade(evaluation.grades.playmaking)) {
    weaknesses.push(
      `Your playmaking impact is limited: ${evaluation.perGame.apg} APG with a ${evaluation.grades.playmaking} grade.`
    );
  }

  if (isWeakGrade(evaluation.grades.astTo)) {
    weaknesses.push(
      `Your possession control needs work: the AST/TO grade is ${evaluation.grades.astTo}.`
    );
  }

  if (isWeakGrade(evaluation.grades.fg) || isWeakGrade(evaluation.grades.three)) {
    weaknesses.push(
      `Your shooting profile has a weak link: ${evaluation.input.fgPct}% FG grades ${evaluation.grades.fg}, and ${evaluation.input.threePct}% from three grades ${evaluation.grades.three}.`
    );
  }

  if (isWeakGrade(evaluation.grades.ft)) {
    weaknesses.push(
      `Your free throw percentage is a liability: ${evaluation.input.ftPct}% with a ${evaluation.grades.ft} grade.`
    );
  }

  if (isWeakGrade(evaluation.grades.winning)) {
    weaknesses.push(
      `Your win rate is dragging the profile down: ${evaluation.input.winPct}% with a ${evaluation.grades.winning} grade.`
    );
  }

  if (weaknesses.length) return weaknesses;

  const eliteCount = Object.values(evaluation.grades).filter((grade) =>
    ["A+", "A"].includes(grade)
  ).length;

  if (eliteCount >= 4) {
    const relativeWeaknesses = Object.entries(evaluation.grades)
      .filter(([, grade]) => ["C+", "C"].includes(grade))
      .map(([category, grade]) => `${category} sits at ${grade}`);

    if (relativeWeaknesses.length) {
      return [
        `You do not have a major core weakness, but ${relativeWeaknesses.join(
          ", "
        )} and stands out beside the elite parts of the profile.`,
      ];
    }
  }

  return ["No major core weakness is dragging the profile down."];
}

function getPlayerComparison(role: string, input: PlayerInput) {
  if (input.name.toLowerCase().includes("goodkarmaa")) {
    return {
      name: "LeBron James (2012-13 Heat) with Stephen Curry-level shooting pressure",
      reasoning:
        "The closest read is a primary offensive engine who combines elite scoring, elite playmaking, elite efficiency, and winning impact. The LeBron side covers the all-around command and creation load, while the Curry side covers the absurd shooting pressure.",
    };
  }

  if (role === "Primary Engine") {
    return {
      name: "Primary engine comparison pending",
      reasoning:
        "This player drives both scoring and creation, but the exact NBA/ABA comparison needs the full comp database before locking a name.",
    };
  }

  if (role === "Efficient Scoring Weapon") {
    return {
      name: "Efficient scorer comparison pending",
      reasoning:
        "This profile is built around scoring and shooting value. The exact comp should be assigned after comparing role, efficiency, and passing level against the larger database.",
    };
  }

  if (role === "Setup Support") {
    return {
      name: "Playmaking support comparison pending",
      reasoning:
        "This player creates offense while protecting possessions. The exact comp needs to be matched to assist volume, scoring pressure, and defensive contribution.",
    };
  }

  return {
    name: "Comparison pending",
    reasoning:
      "The comparison system is active, but this profile needs the larger player-comp database before assigning a final NBA/ABA match.",
  };
}

function buildScoutingSummary(evaluation: {
  input: PlayerInput;
  role: string;
  tier: ReturnType<typeof getTier>;
  trueContribution: ReturnType<typeof getTrueContribution>;
  advanced: AdvancedStats;
  winningTag: string;
}) {
  return `${evaluation.input.name} profiles as a ${evaluation.role}. The tier result is ${evaluation.tier.tier} — ${evaluation.tier.tierName}, built from the 8 core categories only. The True Contribution score is ${evaluation.trueContribution.score}/100, which reflects production, efficiency, ball security, impact coverage, and core weaknesses. The best lineup fit is a team that lets this player lean into ${evaluation.advanced.reads.efficiencyComposite.toLowerCase()} and ${evaluation.advanced.reads.fastbreakCreationAverage.toLowerCase()} without pretending every weakness magically stopped existing.`;
}

export function evaluatePlayer(input: PlayerInput): Evaluation {
  const normalizedInput: PlayerInput = {
    ...input,
    games: Number(input.games || 0),
    points: Number(input.points || 0),
    rebounds: Number(input.rebounds || 0),
    assists: Number(input.assists || 0),
    steals: Number(input.steals || 0),
    blocks: Number(input.blocks || 0),
    turnovers: Number(input.turnovers || 0),
    fouls: Number(input.fouls || 0),
    fgPct: Number(input.fgPct || 0),
    threePct: Number(input.threePct || 0),
    ftPct: Number(input.ftPct || 0),
    winPct: Number(input.winPct || 0),
  };

  const perGame = calculatePerGame(normalizedInput);
  const grades = calculateGrades(normalizedInput, perGame);
  const advanced = calculateAdvanced(normalizedInput, perGame, grades);
  const tier = getTier(grades);
  const winningTag = getWinningTag(normalizedInput, grades);
  const badges = getBadges(normalizedInput, perGame, grades, advanced);
  const role = getRole(perGame, grades, advanced);
  const trueContribution = getTrueContribution(
    normalizedInput,
    perGame,
    grades,
    advanced
  );

  const baseEvaluation = {
    input: normalizedInput,
    perGame,
    grades,
    advanced,
    tier,
    winningTag,
    badges,
    role,
    trueContribution,
  };

  const playerComparison = getPlayerComparison(role, normalizedInput);

  return {
    scaleVersion: ASSOCIATION_SCALE_VERSION,
    ...baseEvaluation,
    strengths: buildStrengths(baseEvaluation),
    weaknesses: buildWeaknesses(baseEvaluation),
    scoutingSummary: buildScoutingSummary(baseEvaluation),
    playerComparison,
  };
}