export type Grade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "C+"
  | "C"
  | "D+"
  | "D"
  | "F";

export type CoreCategory =
  | "scoring"
  | "playmaking"
  | "astTo"
  | "rebounding"
  | "fg"
  | "three"
  | "ft"
  | "winning";

export type FullCategory = CoreCategory | "steals" | "blocks";

export type PlayerInput = {
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

export type PerGameStats = {
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  topg: number;
  fpg: number;
};

export type AdvancedStats = {
  astTo: number;
  pointsPerAssist: number;
  assistToPointRatio: number;
  reboundsToAssistRatio: number;
  fastbreakCreationAverage: number;
  stealsToFoulRatio: number;
  pointsPerTurnover: number;
  efficiencyComposite: Grade;
  reads: {
    pointsPerAssist: string;
    assistToPointRatio: string;
    fastbreakCreationAverage: string;
    stealsToFoulRatio: string;
    efficiencyComposite: string;
  };
};

export type GradeSet = Record<FullCategory, Grade>;

export const ASSOCIATION_SCALE_VERSION =
  "Association Impact Scale vNext — v4.6-development + True Contribution v3.1";

export const CORE_CATEGORIES: CoreCategory[] = [
  "scoring",
  "playmaking",
  "astTo",
  "rebounding",
  "fg",
  "three",
  "ft",
  "winning",
];

export const GRADE_POINTS: Record<Grade, number> = {
  "A+": 4.3,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "C+": 2.3,
  C: 2.0,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

export function round(value: number, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(decimals));
}

export function normalizePercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return value <= 1 ? value * 100 : value;
}

export function safeDivide(numerator: number, denominator: number) {
  if (!denominator || denominator === 0) return 0;
  return numerator / denominator;
}

export function calculatePerGame(input: PlayerInput): PerGameStats {
  const games = input.games || 1;

  return {
    ppg: round(input.points / games),
    rpg: round(input.rebounds / games),
    apg: round(input.assists / games),
    spg: round(input.steals / games),
    bpg: round(input.blocks / games),
    topg: round(input.turnovers / games),
    fpg: round(input.fouls / games),
  };
}

export function gradeScoring(ppg: number): Grade {
  if (ppg >= 28) return "A+";
  if (ppg >= 24) return "A";
  if (ppg >= 21) return "A-";
  if (ppg >= 18) return "B";
  if (ppg >= 15) return "C+";
  if (ppg >= 12) return "C";
  if (ppg >= 9) return "D+";
  return "F";
}

export function gradePlaymaking(apg: number): Grade {
  if (apg >= 8) return "A+";
  if (apg >= 7) return "A";
  if (apg >= 6) return "A-";
  if (apg >= 5) return "B";
  if (apg >= 4) return "C+";
  if (apg >= 3) return "C";
  if (apg >= 2) return "D";
  return "F";
}

export function gradeAstTo(astTo: number): Grade {
  if (astTo >= 5) return "A+";
  if (astTo >= 4) return "A";
  if (astTo >= 3.5) return "A-";
  if (astTo >= 3) return "B+";
  if (astTo >= 2.5) return "B";
  if (astTo >= 2) return "C";
  if (astTo >= 1.5) return "D";
  return "F";
}

export function gradeRebounding(rpg: number): Grade {
  if (rpg >= 8) return "A+";
  if (rpg >= 6.5) return "A";
  if (rpg >= 5) return "A-";
  if (rpg >= 3.5) return "B";
  if (rpg >= 2) return "C";
  if (rpg >= 1) return "D";
  return "F";
}

export function gradeFg(fgPctRaw: number): Grade {
  const fgPct = normalizePercent(fgPctRaw);

  if (fgPct >= 75) return "A+";
  if (fgPct >= 70) return "A";
  if (fgPct >= 65) return "A-";
  if (fgPct >= 60) return "B";
  if (fgPct >= 55) return "C";
  if (fgPct >= 45) return "D";
  return "F";
}

export function gradeThree(threePctRaw: number): Grade {
  const threePct = normalizePercent(threePctRaw);

  if (threePct >= 70) return "A+";
  if (threePct >= 66) return "A";
  if (threePct >= 62) return "A-";
  if (threePct >= 58) return "B";
  if (threePct >= 54) return "C";
  if (threePct >= 50) return "D";
  return "F";
}

export function gradeFt(ftPctRaw: number): Grade {
  const ftPct = normalizePercent(ftPctRaw);

  if (ftPct >= 95) return "A+";
  if (ftPct >= 90) return "A";
  if (ftPct >= 85) return "A-";
  if (ftPct >= 80) return "B";
  if (ftPct >= 70) return "C";
  if (ftPct >= 60) return "D";
  return "F";
}

export function gradeWinning(winPctRaw: number): Grade {
  const winPct = normalizePercent(winPctRaw);

  if (winPct >= 70) return "A+";
  if (winPct >= 65) return "A";
  if (winPct >= 60) return "A-";
  if (winPct >= 55) return "B";
  if (winPct >= 50) return "C";
  if (winPct >= 45) return "D";
  return "F";
}

export function gradeSteals(spg: number): Grade {
  if (spg >= 2.5) return "A+";
  if (spg >= 2) return "A";
  if (spg >= 1.5) return "A-";
  if (spg >= 1) return "B";
  if (spg >= 0.5) return "C";
  return "F";
}

export function gradeBlocks(bpg: number): Grade {
  if (bpg >= 1) return "A+";
  if (bpg >= 0.7) return "A";
  if (bpg >= 0.5) return "A-";
  if (bpg >= 0.3) return "B";
  if (bpg >= 0.15) return "C";
  return "F";
}

export function getEfficiencyComposite(fgGrade: Grade, threeGrade: Grade): Grade {
  return GRADE_POINTS[fgGrade] <= GRADE_POINTS[threeGrade] ? fgGrade : threeGrade;
}

export function calculateGrades(input: PlayerInput, perGame: PerGameStats): GradeSet {
  const astTo = safeDivide(input.assists, input.turnovers);

  const fg = gradeFg(input.fgPct);
  const three = gradeThree(input.threePct);

  return {
    scoring: gradeScoring(perGame.ppg),
    playmaking: gradePlaymaking(perGame.apg),
    astTo: gradeAstTo(astTo),
    rebounding: gradeRebounding(perGame.rpg),
    fg,
    three,
    ft: gradeFt(input.ftPct),
    winning: gradeWinning(input.winPct),
    steals: gradeSteals(perGame.spg),
    blocks: gradeBlocks(perGame.bpg),
  };
}

export function getTier(grades: GradeSet) {
  const coreAverage = round(
    CORE_CATEGORIES.reduce((sum, category) => sum + GRADE_POINTS[grades[category]], 0) /
      CORE_CATEGORIES.length,
    2
  );

  if (coreAverage >= 3.8) {
    return { tier: "S", tierName: "Franchise Cornerstone", coreAverage };
  }

  if (coreAverage >= 3.4) {
    return { tier: "A+", tierName: "Hall of Fame", coreAverage };
  }

  if (coreAverage >= 3.0) {
    return { tier: "A", tierName: "Star", coreAverage };
  }

  if (coreAverage >= 2.7) {
    return { tier: "A-", tierName: "Star (lower band)", coreAverage };
  }

  if (coreAverage >= 2.4) {
    return { tier: "B+", tierName: "High-End Starter", coreAverage };
  }

  if (coreAverage >= 2.1) {
    return { tier: "B", tierName: "Starter", coreAverage };
  }

  if (coreAverage >= 1.8) {
    return { tier: "C+", tierName: "Role Player", coreAverage };
  }

  if (coreAverage >= 1.5) {
    return { tier: "C", tierName: "Rotation Player", coreAverage };
  }

  return { tier: "D", tierName: "Low Impact Rotation", coreAverage };
}

export function getFastbreakCreationRead(value: number) {
  if (value >= 13) return "Elite transition engine";
  if (value >= 11) return "High-level fastbreak creator";
  if (value >= 9) return "Scoring-driven transition contributor";
  if (value >= 7) return "Balanced transition support";
  if (value >= 5) return "Limited transition contribution";
  return "Half-court dependent profile";
}

export function getEfficiencyRead(grade: Grade) {
  if (["A+", "A", "A-"].includes(grade)) return "Elite efficiency foundation";
  if (["B+", "B"].includes(grade)) return "Reliable efficiency profile";
  if (["C+", "C"].includes(grade)) return "Average efficiency profile";
  if (["D+", "D"].includes(grade)) return "Efficiency concern";
  return "Major efficiency weakness";
}

export function calculateAdvanced(
  input: PlayerInput,
  perGame: PerGameStats,
  grades: GradeSet
): AdvancedStats {
  const astTo = round(safeDivide(input.assists, input.turnovers));
  const pointsPerAssist = round(safeDivide(input.points, input.assists));
  const assistToPointRatio = round(safeDivide(input.assists, input.points), 3);
  const reboundsToAssistRatio = round(safeDivide(input.rebounds, input.assists), 3);
  const fastbreakCreationAverage = round((perGame.ppg + perGame.rpg + perGame.apg) / 3);
  const stealsToFoulRatio = round(safeDivide(input.steals, input.fouls));
  const pointsPerTurnover = round(safeDivide(input.points, input.turnovers));
  const efficiencyComposite = getEfficiencyComposite(grades.fg, grades.three);

  return {
    astTo,
    pointsPerAssist,
    assistToPointRatio,
    reboundsToAssistRatio,
    fastbreakCreationAverage,
    stealsToFoulRatio,
    pointsPerTurnover,
    efficiencyComposite,
    reads: {
      pointsPerAssist:
        pointsPerAssist >= 4
          ? "Scoring-heavy offensive profile"
          : pointsPerAssist >= 2.5
            ? "Balanced scoring and creation profile"
            : "Pass-first creation profile",
      assistToPointRatio:
        assistToPointRatio >= 0.35
          ? "Creation-leaning profile"
          : assistToPointRatio >= 0.2
            ? "Balanced creation share"
            : "Scoring-dominant profile",
      fastbreakCreationAverage: getFastbreakCreationRead(fastbreakCreationAverage),
      stealsToFoulRatio:
        stealsToFoulRatio >= 1.5
          ? "Clean defensive activity"
          : stealsToFoulRatio >= 0.8
            ? "Moderate defensive discipline"
            : "Reckless or low defensive activity",
      efficiencyComposite: getEfficiencyRead(efficiencyComposite),
    },
  };
}

export function getWinningTag(input: PlayerInput, grades: GradeSet) {
  const winPct = normalizePercent(input.winPct);

  const eliteImpactCount = [grades.scoring, grades.playmaking, grades.astTo, grades.fg].filter(
    (grade) => ["A+", "A", "A-"].includes(grade)
  ).length;

  const strongImpactCount = [grades.scoring, grades.playmaking, grades.astTo, grades.fg].filter(
    (grade) => ["A+", "A", "A-", "B+"].includes(grade)
  ).length;

  if (winPct >= 75 && eliteImpactCount >= 2) return "Transcendent Winner";
  if (winPct >= 70 && eliteImpactCount >= 2) return "Elite Winner";
  if (winPct >= 60 && strongImpactCount >= 1) return "Winner";
  if (winPct >= 55) return "Above Average";
  if (winPct >= 45) return "Neutral";

  const individualProfileStrong =
    ["A+", "A", "A-", "B+"].includes(grades.scoring) ||
    ["A+", "A", "A-", "B+"].includes(grades.playmaking) ||
    ["A+", "A", "A-", "B+"].includes(grades.astTo) ||
    ["A+", "A", "A-", "B+"].includes(grades.fg);

  return individualProfileStrong
    ? "Below Average (Circumstantial)"
    : "Below Average (Contributing)";
}

export function getBadges(
  input: PlayerInput,
  perGame: PerGameStats,
  grades: GradeSet,
  advanced: AdvancedStats
) {
  const badges: string[] = [];

  const fgPct = normalizePercent(input.fgPct);
  const threePct = normalizePercent(input.threePct);
  const ftPct = normalizePercent(input.ftPct);

  if (threePct >= 75) badges.push("Flamethrower");
  else if (threePct >= 69) badges.push("Perimeter Threat");

  if (fgPct >= 70 && threePct >= 70 && ftPct >= 90) badges.push("Walking Bucket");

  if (fgPct >= 70 && threePct >= 70 && advanced.assistToPointRatio < 0.15) {
    badges.push("Sniper");
  }

  if (perGame.ppg >= 20 && fgPct >= 60 && threePct >= 60 && perGame.apg < 4) {
    badges.push("Lone Wolf");
  }

  if (fgPct >= 65 && fgPct <= 69.9 && threePct >= 65 && threePct <= 69.9) {
    badges.push("Reliable Shooter");
  }

  if (ftPct >= 90) badges.push("Money at the Line");
  if (ftPct < 60) badges.push("Foul Me");

  if (perGame.apg >= 7 && ["A+", "A", "A-"].includes(grades.astTo)) {
    badges.push("Visionary");
  } else if (
    perGame.apg >= 5 &&
    perGame.apg < 7 &&
    ["A+", "A", "A-"].includes(grades.astTo)
  ) {
    badges.push("Dimer");
  }

  if (perGame.rpg >= 8) badges.push("Vacuum");
  else if (perGame.rpg >= 7.1) badges.push("Board Man");
  else if (perGame.rpg >= 5) badges.push("Glass Cleaner");

  if (perGame.bpg >= 1) badges.push("Smack em'");
  else if (perGame.bpg >= 0.65) badges.push("Rejecter");

  if (perGame.spg >= 2.5) badges.push("Klepto");
  else if (perGame.spg >= 2) badges.push("Cookie Monster");

  if (advanced.stealsToFoulRatio >= 1.5) badges.push("Disciplined Defender");

  if (advanced.astTo < 3) badges.push("Turnover Prone");

  if (
    advanced.reboundsToAssistRatio >= 0.8 &&
    advanced.reboundsToAssistRatio <= 1.2 &&
    perGame.rpg >= 4 &&
    perGame.apg >= 4
  ) {
    badges.push("Break Igniter");
  }

  const coreFCount = CORE_CATEGORIES.filter((category) => grades[category] === "F").length;
  if (coreFCount >= 2) badges.push("Heavy");

  return badges;
}

export function getTrueContribution(
  input: PlayerInput,
  perGame: PerGameStats,
  grades: GradeSet,
  advanced: AdvancedStats
) {
  const fgDecimal = normalizePercent(input.fgPct) / 100;
  const threeDecimal = normalizePercent(input.threePct) / 100;
  const winDecimal = normalizePercent(input.winPct) / 100;

  const shootingAverage = (fgDecimal + threeDecimal) / 2;

  const baseImpact =
    perGame.ppg +
    perGame.apg +
    perGame.rpg * 0.75 +
    perGame.spg * 1.5 +
    perGame.bpg * 2.0 -
    perGame.topg * 0.5 -
    perGame.fpg * 0.25;

  const shootingModifier = clamp(1 + (shootingAverage - 0.6) * 0.75, 0.85, 1.2);
  const winModifier = clamp(1 + (winDecimal - 0.5), 0.85, 1.2);
  const ballSecurityModifier = clamp(1 + (advanced.astTo - 3.0) * 0.03, 0.9, 1.1);

  const impactCoverageCount = [
    grades.scoring,
    grades.playmaking,
    grades.astTo,
    grades.rebounding,
    grades.steals,
    grades.blocks,
    shootingAverage >= 0.6 ? "B" : "F",
    grades.winning,
  ].filter((grade) => ["A+", "A", "A-", "B+", "B"].includes(grade)).length;

  const impactCoverageModifier = clamp(1 + (impactCoverageCount - 3) * 0.03, 0.9, 1.15);

  const coreWeaknessCount = CORE_CATEGORIES.filter((category) =>
    ["D+", "D", "F"].includes(grades[category])
  ).length;

  const weaknessModifier = clamp(1 - coreWeaknessCount * 0.03, 0.8, 1.0);

  const score = round(
    baseImpact *
      shootingModifier *
      winModifier *
      ballSecurityModifier *
      impactCoverageModifier *
      weaknessModifier
  );

  return {
    score: clamp(score, 0, 100),
    label: getTrueContributionLabel(score),
    baseImpact: round(baseImpact),
    shootingModifier: round(shootingModifier, 3),
    winModifier: round(winModifier, 3),
    ballSecurityModifier: round(ballSecurityModifier, 3),
    impactCoverageModifier: round(impactCoverageModifier, 3),
    weaknessModifier: round(weaknessModifier, 3),
    impactCoverageCount,
    coreWeaknessCount,
  };
}

export function getTrueContributionLabel(score: number) {
  if (score >= 90) return "Historic Contribution";
  if (score >= 80) return "Elite Contribution";
  if (score >= 70) return "Franchise Contribution";
  if (score >= 60) return "Heavy Contribution";
  if (score >= 50) return "Strong Contribution";
  if (score >= 40) return "Solid Contribution";
  if (score >= 30) return "Support Contribution";
  if (score >= 20) return "Limited Contribution";
  return "Low Contribution";
}

export function getRole(perGame: PerGameStats, grades: GradeSet, advanced: AdvancedStats) {
  if (
    ["A+", "A", "A-"].includes(grades.scoring) &&
    ["A+", "A", "A-"].includes(grades.playmaking) &&
    ["A+", "A", "A-"].includes(advanced.efficiencyComposite)
  ) {
    return "Primary Engine";
  }

  if (["A+", "A", "A-"].includes(grades.scoring) && ["A+", "A", "A-"].includes(grades.fg)) {
    return "Efficient Scoring Weapon";
  }

  if (["A+", "A", "A-"].includes(grades.playmaking) && ["A+", "A", "A-"].includes(grades.astTo)) {
    return "Setup Support";
  }

  if (["A+", "A", "A-"].includes(grades.rebounding) && ["A+", "A", "A-"].includes(grades.blocks)) {
    return "Interior Anchor";
  }

  if (["A+", "A", "A-"].includes(grades.steals) || ["A+", "A", "A-"].includes(grades.blocks)) {
    return "Defensive Disruptor";
  }

  if (perGame.rpg >= 4 && perGame.apg >= 4 && advanced.fastbreakCreationAverage >= 7) {
    return "All-Around Stabilizer";
  }

  return "Role Contributor";
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}