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

  return {
    matchId: match.metadata?.match_id,
    queueId,
    queueLabel: getQueueLabel(queueId),
    gameDatetime,
    gameLengthSeconds,
    placement: participant.placement ?? null,
    level: participant.level ?? null,
    lastRound: participant.last_round ?? null,
    playersEliminated: participant.players_eliminated ?? null,
    timeEliminated: participant.time_eliminated ?? null,
    augments: participant.augments ?? [],
    traits: (participant.traits ?? [])
      .filter((trait: any) => trait.style > 0)
      .sort((a: any, b: any) => b.style - a.style)
      .map((trait: any) => ({
        name: trait.name,
        numUnits: trait.num_units,
        style: trait.style,
        tierCurrent: trait.tier_current,
        tierTotal: trait.tier_total,
      })),
    units: (participant.units ?? [])
      .sort((a: any, b: any) => (b.rarity ?? 0) - (a.rarity ?? 0))
      .map((unit: any) => ({
        characterId: unit.character_id,
        itemNames: unit.itemNames ?? [],
        tier: unit.tier ?? null,
        rarity: unit.rarity ?? null,
        chosen: unit.chosen ?? null,
      })),
  };
}