function getQueueLabel(queueId?: number | null) {
  switch (queueId) {
    case 1100:
      return "Ranked";
    case 1090:
      return "Normal";
    case 1110:
      return "Tutorial";
    case 1130:
      return "Hyper Roll";
    case 1160:
      return "Double Up";
    default:
      return "TFT";
  }
}

function extractPatch(gameVersion?: string | null) {
  if (!gameVersion) return "unknown";

  const match = gameVersion.match(/(\d+)\.(\d+)/);
  if (!match) return gameVersion;

  return `${match[1]}.${match[2]}`;
}

function mapTraits(traits: any[] = []) {
  return traits
    .filter((trait: any) => (trait?.style ?? 0) > 0)
    .sort((a: any, b: any) => (b.style ?? 0) - (a.style ?? 0))
    .map((trait: any) => ({
      name: trait.name,
      numUnits: trait.num_units ?? null,
      style: trait.style ?? 0,
      tierCurrent: trait.tier_current ?? null,
      tierTotal: trait.tier_total ?? null,
    }));
}

function mapUnits(units: any[] = []) {
  return [...units]
    .sort((a: any, b: any) => (b.rarity ?? 0) - (a.rarity ?? 0))
    .map((unit: any) => {
      
      let itemNames: string[] = [];

      if (Array.isArray(unit.itemNames) && unit.itemNames.length) {
        itemNames = unit.itemNames;
      } else if (Array.isArray(unit.items) && unit.items.length) {
        itemNames = unit.items
          .filter((item: number) => item && item > 0)
          .map((item: number) => `TFT_Item_${item}`);
      }

      return {
        characterId: unit.character_id,
        itemNames,
        tier: unit.tier ?? null,
        rarity: unit.rarity ?? null,
        chosen: unit.chosen ?? null,
      };
    });
}

function mapLobbyPlayer(player: any, currentPuuid: string) {
  return {
    puuid: player.puuid,
    riotIdGameName: player.riotIdGameName ?? null,
    riotIdTagLine: player.riotIdTagline ?? null,
    placement: player.placement ?? null,
    level: player.level ?? null,
    lastRound: player.last_round ?? null,
    playersEliminated: player.players_eliminated ?? null,
    timeEliminated: player.time_eliminated ?? null,
    totalDamageToPlayers: player.total_damage_to_players ?? null,
    augments: player.augments ?? [],
    traits: mapTraits(player.traits ?? []),
    units: mapUnits(player.units ?? []),
    companion: player.companion
      ? {
          contentId: player.companion.content_ID ?? null,
          itemId: player.companion.item_ID ?? null,
          skinId: player.companion.skin_ID ?? null,
          species: player.companion.species ?? null,
        }
      : null,
    isCurrentPlayer: player.puuid === currentPuuid,
  };
}

export function mapTftMatch(match: any, puuid: string) {
  const participant = match?.info?.participants?.find(
    (item: any) => item.puuid === puuid
  );

  if (!participant) {
    return null;
  }

  const queueId = match?.info?.queue_id ?? null;
  const gameDatetime = match?.info?.game_datetime ?? null;
  const gameLengthSeconds =
    typeof match?.info?.game_length === "number"
      ? Math.round(match.info.game_length)
      : null;

  const patch = extractPatch(match?.info?.game_version ?? null);

  const lobby = (match?.info?.participants ?? [])
    .map((player: any) => mapLobbyPlayer(player, puuid))
    .sort((a: any, b: any) => (a.placement ?? 99) - (b.placement ?? 99));

  return {
    matchId: match.metadata?.match_id,
    queueId,
    queueLabel: getQueueLabel(queueId),
    gameDatetime,
    gameLengthSeconds,
    patch,
    placement: participant.placement ?? null,
    level: participant.level ?? null,
    lastRound: participant.last_round ?? null,
    playersEliminated: participant.players_eliminated ?? null,
    timeEliminated: participant.time_eliminated ?? null,
    totalDamageToPlayers: participant.total_damage_to_players ?? null,
    augments: participant.augments ?? [],
    traits: mapTraits(participant.traits ?? []),
    units: mapUnits(participant.units ?? []),
    companion: participant.companion
      ? {
          contentId: participant.companion.content_ID ?? null,
          itemId: participant.companion.item_ID ?? null,
          skinId: participant.companion.skin_ID ?? null,
          species: participant.companion.species ?? null,
        }
      : null,
    lobby,
  };
}