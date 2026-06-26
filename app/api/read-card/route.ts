import { NextRequest, NextResponse } from "next/server";

type ExtractedCardStats = {
  validCard?: boolean;
  rejectionReason?: string;
  stats?: {
    name?: string;
    games?: number;
    points?: number;
    rebounds?: number;
    assists?: number;
    steals?: number;
    blocks?: number;
    turnovers?: number;
    fouls?: number;
    fgPct?: number;
    threePct?: number;
    ftPct?: number;
    winPct?: number;
  };
};

const goodKarmaaDemoStats = {
  name: "GoodKarmaa",
  games: 961,
  points: 27214,
  rebounds: 2737,
  assists: 7353,
  steals: 800,
  blocks: 465,
  turnovers: 1916,
  fouls: 908,
  fgPct: 77.8,
  threePct: 79.8,
  ftPct: 94.8,
  winPct: 65.9,
};

function cleanJson(text: string) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const cleaned = value.replace(/[%,$,\s]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}
function validateExtractedStats(stats: {
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
}): void {
  const required: Array<keyof typeof stats> = [
    "games",
    "points",
    "rebounds",
    "assists",
    "steals",
    "blocks",
    "turnovers",
    "fouls",
    "fgPct",
    "threePct",
    "ftPct",
    "winPct",
  ];

  for (const key of required) {
    if (typeof stats[key] !== "number" || Number.isNaN(stats[key])) {
      throw new Error(`Extraction failed: missing or invalid field "${key}".`);
    }
  }

  if (stats.games <= 0) {
    throw new Error("Extraction failed: games must be greater than 0.");
  }

  if (stats.fouls > stats.games * 6) {
    throw new Error(
      "Extraction failed: fouls are implausibly high relative to games played."
    );
  }

  if (stats.turnovers === stats.steals && stats.turnovers > 0) {
    console.warn(
      "Suspicious extraction: turnovers exactly equals steals. Possible OCR field swap."
    );
  }

  if (stats.points < stats.assists) {
    console.warn(
      "Suspicious extraction: assists exceed points. Verify this player card."
    );
  }
}
function isQuotaError(text: string) {
  const lowered = text.toLowerCase();

  return (
    lowered.includes("insufficient_quota") ||
    lowered.includes("quota") ||
    lowered.includes("billing")
  );
}

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl } = await req.json();

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return NextResponse.json(
        { error: "Missing imageDataUrl." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  return NextResponse.json(
    {
      error:
        "OPENAI_API_KEY is missing. Add it to .env.local before live card reading can work.",
    },
    { status: 500 }
  );
}

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
  {
  role: "user",
  content: [
    {
      type: "input_text",
      text: [
        "You are reading an uploaded image for The Association, an NBA 2K REC player-card evaluator.",
      "Before extracting stats, determine whether the image is a valid NBA 2K REC player card screenshot in the required layout.",
  "It must include a top 2K Card header area with player name/OVR/archetype area.",
  "It must include the THE REC logo area on the left.",
  "It must include a visible stats panel with these labels: Games Played, Points, Rebounds, Assists, 3 Point %, Free Throw %, Steals, Blocks, Win %, Field Goal %, Turnovers, Fouls.",
  "If the image is not clearly this exact kind of NBA 2K REC player card, return validCard false and stats null.",
  "Do not guess stats from random images, box scores, screenshots, portraits, menus, or unrelated graphics.",
  "Return ONLY valid JSON. No markdown. No explanation.",
  "Use this exact response shape:",
  "{\"validCard\":true,\"rejectionReason\":\"\",\"stats\":{\"name\":\"string\",\"games\":0,\"points\":0,\"rebounds\":0,\"assists\":0,\"steals\":0,\"blocks\":0,\"turnovers\":0,\"fouls\":0,\"fgPct\":0,\"threePct\":0,\"ftPct\":0,\"winPct\":0}}",
  "For invalid images, return:",
  "{\"validCard\":false,\"rejectionReason\":\"Image does not match the required NBA 2K REC player card layout.\",\"stats\":null}",
  "Percentages should be numbers like 68.7, not 0.687.",
  "If a required stat is not visible on an otherwise valid card, use 0 for that stat.",
].join(" "),
              },
              {
                type: "input_image",
                image_url: imageDataUrl,
                detail: "high",
              },
            ],
          },
        ],
        max_output_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

if (isQuotaError(errorText)) {
  return NextResponse.json(
    {
      error:
        "OpenAI quota or billing is not active. Card reading cannot run until the OpenAI API key has billing/quota available.",
    },
    { status: 500 }
  );
}

      return NextResponse.json(
        {
          error: "OpenAI card reading failed.",
          details: errorText,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    const outputText =
      data.output_text ??
      data.output?.[0]?.content?.find(
        (item: { type?: string }) => item.type === "output_text"
      )?.text ??
      "";

    if (!outputText) {
      return NextResponse.json(
        { error: "No text returned from card reader." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(cleanJson(outputText)) as ExtractedCardStats;
    if (!parsed.validCard || !parsed.stats) {
      return NextResponse.json(
        {
          error:
            parsed.rejectionReason ||
            "This does not appear to be a valid NBA 2K REC player card. Please upload a clear screenshot of the full player card.",
        },
        { status: 400 }
      );
    }
           const stats = {
      name: parsed.stats.name ?? "Unknown Player",
      games: toNumber(parsed.stats.games),
      points: toNumber(parsed.stats.points),
      rebounds: toNumber(parsed.stats.rebounds),
      assists: toNumber(parsed.stats.assists),
      steals: toNumber(parsed.stats.steals),
      blocks: toNumber(parsed.stats.blocks),
      turnovers: toNumber(parsed.stats.turnovers),
      fouls: toNumber(parsed.stats.fouls),
      fgPct: toNumber(parsed.stats.fgPct),
      threePct: toNumber(parsed.stats.threePct),
      ftPct: toNumber(parsed.stats.ftPct),
      winPct: toNumber(parsed.stats.winPct),
    };

    validateExtractedStats(stats);

       return NextResponse.json({
      stats,
      demoMode: false,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not read player card." },
      { status: 500 }
    );
  }
}