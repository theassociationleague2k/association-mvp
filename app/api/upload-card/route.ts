import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { evaluatePlayer } from "@/lib/evaluation";
import type { PlayerInput } from "@/lib/evaluation";
import { buildAssociationProfile } from "@/lib/buildAssociationProfile";

type AIPlayerComparison = {
  name: string;
  reasoning: string;
};

function cleanFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
}

function cleanPlayerFolderName(name: string) {
  return name.trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function cleanJson(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function getOpenAIText(data: any) {
  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  const output = data?.output;

  if (Array.isArray(output)) {
    const parts: string[] = [];

    for (const item of output) {
      const content = item?.content;

      if (Array.isArray(content)) {
        for (const contentItem of content) {
          if (typeof contentItem?.text === "string") {
            parts.push(contentItem.text);
          }
        }
      }
    }

    return parts.join("\n").trim();
  }

  return "";
}

function buildStarterProfileJson(
  playerName: string,
  imageUrl: string,
  storagePath: string
) {
  return {
    playerName,

    badges: [],

    styleAndRole: {
      comp: "Pending evaluation",
      role: "Pending evaluation",
      fit: "Pending evaluation",
    },

    perGame: {
      ppg: { value: null, grade: "N/A" },
      apg: { value: null, grade: "N/A" },
      rpg: { value: null, grade: "N/A" },
      spg: { value: null, grade: "N/A" },
      bpg: { value: null, grade: "N/A" },
      topg: { value: null, grade: "N/A" },
    },

    efficiency: {
      astToTurnover: { value: null, grade: "N/A" },
      fgPct: { value: null, grade: "N/A" },
      threePct: { value: null, grade: "N/A" },
      ftPct: { value: null, grade: "N/A" },
    },

    winPct: {
      value: null,
      grade: "N/A",
    },

    tier: "Pending",

    associationLeader: [],

    scouting: {
      strengths: "Pending evaluation",
      weaknesses: "Pending evaluation",
      finalSummary: "Pending evaluation",
    },

    media: {
      uploadedCardUrl: imageUrl,
      storagePath,
    },
  };
}

function parseStatsJson(statsJson: string | null): PlayerInput | null {
  if (!statsJson) return null;

  const parsed = JSON.parse(statsJson) as Partial<PlayerInput>;

  if (!parsed.name) {
    throw new Error("Stats JSON is missing player name.");
  }

  return {
    name: String(parsed.name),
    games: Number(parsed.games ?? 0),
    points: Number(parsed.points ?? 0),
    rebounds: Number(parsed.rebounds ?? 0),
    assists: Number(parsed.assists ?? 0),
    steals: Number(parsed.steals ?? 0),
    blocks: Number(parsed.blocks ?? 0),
    turnovers: Number(parsed.turnovers ?? 0),
    fouls: Number(parsed.fouls ?? 0),
    fgPct: Number(parsed.fgPct ?? 0),
    threePct: Number(parsed.threePct ?? 0),
    ftPct: Number(parsed.ftPct ?? 0),
    winPct: Number(parsed.winPct ?? 0),
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

async function generateAIPlayerComparison(
  stats: PlayerInput,
  evaluation: ReturnType<typeof evaluatePlayer>
): Promise<AIPlayerComparison | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const perGame = evaluation.perGame;
  const advanced = evaluation.advanced;
  const grades = evaluation.grades as unknown as Record<string, string>;

  const prompt = `
You are creating a player comparison for a custom NBA 2K REC league called The Association.

Use the player's real stat profile to assign ONE detailed NBA or ABA player comparison.

Rules:
- Give exactly ONE primary player comparison.
- Do not force GOAT-level names unless the production truly supports it.
- Use role, efficiency, creation, winning impact, defense, and weaknesses.
- Be realistic. A weak or limited player should get a role-player comparison.
- Do not mention "2K" in the final comparison.
- Do not use multiple options.
- Do not use vague language like "comparison pending."
- The reasoning should be detailed, useful, and scouting-style.
- Keep the reasoning around 3 to 5 sentences.

Player raw stats:
Name: ${stats.name}
Games: ${stats.games}
Points: ${stats.points}
Rebounds: ${stats.rebounds}
Assists: ${stats.assists}
Steals: ${stats.steals}
Blocks: ${stats.blocks}
Turnovers: ${stats.turnovers}
Fouls: ${stats.fouls}
FG%: ${stats.fgPct}
3PT%: ${stats.threePct}
FT%: ${stats.ftPct}
Win%: ${stats.winPct}

Per game:
PPG: ${round1(perGame.ppg)}
APG: ${round1(perGame.apg)}
RPG: ${round1(perGame.rpg)}
SPG: ${round1(perGame.spg)}
BPG: ${round1(perGame.bpg)}
TOPG: ${round1(stats.turnovers / Math.max(stats.games, 1))}

Advanced:
AST/TO: ${advanced.astTo}
Points Per Assist: ${advanced.pointsPerAssist}
Points Per Turnover: ${advanced.pointsPerTurnover}

Grades:
Scoring: ${grades.scoring}
Playmaking: ${grades.playmaking}
AST/TO: ${grades.astTo}
Rebounding: ${grades.rebounding}
FG: ${grades.fg}
3PT: ${grades.three}
FT: ${grades.ft}
Winning: ${grades.winning}

Tier:
${evaluation.tier?.tier ?? "Pending"} - ${evaluation.tier?.tierName ?? "Pending"}

Role:
${evaluation.role ?? "Role pending"}

Return ONLY valid JSON in this exact shape:
{
  "name": "Player Name-style role",
  "reasoning": "Detailed scouting reason here."
}
`;

  try {
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
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = cleanJson(getOpenAIText(data));

    if (!text) {
      return null;
    }

    const parsed = JSON.parse(text) as Partial<AIPlayerComparison>;

    if (!parsed.name || !parsed.reasoning) {
      return null;
    }

    return {
      name: String(parsed.name),
      reasoning: String(parsed.reasoning),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const playerName = formData.get("playerName") as string | null;
    const statsJson = formData.get("statsJson") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (!playerName || !playerName.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing player name." },
        { status: 400 }
      );
    }

    const cleanName = cleanFileName(file.name);
    const safePlayerName = cleanPlayerFolderName(playerName);
    const timestamp = Date.now();

    const storagePath = `${safePlayerName}/${timestamp}-${cleanName}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("Roster")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("Roster")
      .getPublicUrl(storagePath);

    const imageUrl = publicUrlData.publicUrl;

    const extractedStats = parseStatsJson(statsJson);

    const finalPlayerName = extractedStats?.name || playerName.trim();

    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .upsert(
        {
          player_name: finalPlayerName,
          display_name: finalPlayerName,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "player_name",
        }
      )
      .select("id, player_name")
      .single();

    if (playerError) {
      return NextResponse.json(
        { success: false, error: playerError.message },
        { status: 500 }
      );
    }

    let profileJson: any;

    if (extractedStats) {
      const evaluation = evaluatePlayer(extractedStats);

      profileJson = buildAssociationProfile(
        evaluation,
        imageUrl,
        storagePath
      );

      const aiComparison = await generateAIPlayerComparison(
        extractedStats,
        evaluation
      );

      if (aiComparison) {
        profileJson.styleAndRole = {
          ...profileJson.styleAndRole,
          comp: aiComparison.name,
          fit: `Player Comp: ${aiComparison.name}. ${aiComparison.reasoning}`,
        };
      }
    } else {
      profileJson = buildStarterProfileJson(
        finalPlayerName,
        imageUrl,
        storagePath
      );
    }

    const tier =
      typeof profileJson.tier === "string" ? profileJson.tier : "Pending";

    const { data: card, error: cardError } = await supabaseAdmin
      .from("player_cards")
      .insert({
        player_id: player.id,

        image_url: imageUrl,
        storage_path: storagePath,

        tier,
        overall_grade: tier,

        profile_json: profileJson,
      })
      .select("id, image_url, storage_path, profile_json, created_at")
      .single();

    if (cardError) {
      return NextResponse.json(
        { success: false, error: cardError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: extractedStats
        ? "Card uploaded, evaluated, compared, and saved to database."
        : "Card uploaded and saved as pending evaluation.",
      player,
      card,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown upload error.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}