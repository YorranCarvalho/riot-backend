import { TftMatchSnapshot } from "../types/tft-match-snapshot.type";

type RiotTftParticipant = {
  puuid: string;
  placement: number;
  level: number;
  augments?: string[];
  units?: {
    character_id: string;
    tier?: number;
    rarity?: number;
    items?: number[];
  }[];
  traits?: {
    name: string;
    tier_current: number;
    tier_total?: number;
    style?: number;
  }[];
};

type RiotTftMatch = {
  metadata: {
    match_id: string;
  };
  info: {
    tft_set_number: number;
    game_version?: string;
    participants: RiotTftParticipant[];
  };
};

function extractPatch(gameVersion?: string): string {
  if (!gameVersion) return "unknown";

  const match = gameVersion.match(/(\d+)\.(\d+)/);

  if (!match) return gameVersion;

  return `${match[1]}.${match[2]}`;
}

export function mapRiotMatchToSnapshots(match: RiotTftMatch): TftMatchSnapshot[] {
  const matchId = match.metadata.match_id;
  const patch = extractPatch(match.info.game_version);
  const set = match.info.tft_set_number;

  return (match.info.participants ?? []).map((participant) => ({
    matchId,
    puuid: participant.puuid,
    placement: participant.placement,
    level: participant.level,
    patch,
    set,
    augments: participant.augments ?? [],
    units: (participant.units ?? []).map((unit) => ({
      characterId: unit.character_id,
      name: unit.character_id,
      tier: unit.tier,
      rarity: unit.rarity,
      itemNames: (unit.items ?? []).map(String),
    })),
    traits: (participant.traits ?? []).map((trait) => ({
      name: trait.name,
      tierCurrent: trait.tier_current,
      tierTotal: trait.tier_total,
      style: trait.style,
    })),
  }));
}