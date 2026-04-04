type TftMatch = {
  matchId: string;
  queueId: number | null;
  queueLabel: string;
  gameDatetime: number | null;
  gameLengthSeconds: number | null;
  placement: number | null;
  level: number | null;
  lastRound: number | null;
  playersEliminated: number | null;
  timeEliminated: number | null;
  augments: string[];
  traits: Array<{
    name: string;
    numUnits: number;
    style: number;
    tierCurrent: number;
    tierTotal: number;
  }>;
  units: Array<{
    characterId: string;
    itemNames: string[];
    tier: number | null;
    rarity: number | null;
    chosen: string | null;
  }>;
};

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return (value / total) * 100;
}

function incrementMap(map: Record<string, number>, key: string, amount = 1) {
  map[key] = (map[key] || 0) + amount;
}

function getQueueKey(queueId?: number | null) {
  switch (queueId) {
    case 1100:
      return "ranked";
    case 1090:
      return "normal";
    case 1130:
      return "hyper_roll";
    case 1160:
      return "double_up";
    default:
      return "all";
  }
}

function buildCompSignature(match: TftMatch) {
  const topTraits = [...(match.traits ?? [])]
    .filter((trait) => trait.style > 0)
    .sort((a, b) => {
      if (b.style !== a.style) return b.style - a.style;
      return b.numUnits - a.numUnits;
    })
    .slice(0, 4)
    .map((trait) => trait.name);

  const unitIds = [...(match.units ?? [])]
    .map((unit) => unit.characterId)
    .filter(Boolean)
    .sort();

  return {
    key: `${topTraits.join("|")}__${unitIds.join("|")}`,
    traitIds: topTraits,
    unitIds,
  };
}

function calculateOverview(matches: TftMatch[]) {
  if (!matches.length) return null;

  const placements = matches.map((match) => match.placement ?? 8);
  const levels = matches.map((match) => match.level ?? 0);
  const lastRounds = matches.map((match) => match.lastRound ?? 0);
  const gameTimes = matches.map((match) => match.gameLengthSeconds ?? 0);
  const eliminated = matches.map((match) => match.playersEliminated ?? 0);

  const championMap: Record<string, number> = {};
  const itemMap: Record<string, number> = {};
  const traitMap: Record<string, number> = {};

  let estimatedDamage = 0;

  matches.forEach((match) => {
    const placement = match.placement ?? 8;

    estimatedDamage += Math.max(0, (9 - placement) * 850);

    match.units.forEach((unit) => {
      if (unit.characterId) {
        incrementMap(championMap, unit.characterId);
      }

      unit.itemNames?.forEach((item) => {
        incrementMap(itemMap, item);
      });
    });

    match.traits.forEach((trait) => {
      if (trait.name && trait.style > 0) {
        incrementMap(traitMap, trait.name);
      }
    });
  });

  const favoriteChampion = Object.entries(championMap).sort((a, b) => b[1] - a[1])[0] ?? null;
  const mostUsedItem = Object.entries(itemMap).sort((a, b) => b[1] - a[1])[0] ?? null;
  const mostUsedTrait = Object.entries(traitMap).sort((a, b) => b[1] - a[1])[0] ?? null;

  const top4Count = placements.filter((value) => value <= 4).length;
  const winCount = placements.filter((value) => value === 1).length;

  return {
    totalGames: matches.length,
    avgPlacement: Number(average(placements).toFixed(2)),
    top4Rate: Number(percentage(top4Count, matches.length).toFixed(1)),
    winRate: Number(percentage(winCount, matches.length).toFixed(1)),
    avgGameTimeSeconds: Math.round(average(gameTimes)),
    avgLevel: Number(average(levels).toFixed(1)),
    avgLastRound: Number(average(lastRounds).toFixed(1)),
    avgPlayersEliminated: Number(average(eliminated).toFixed(1)),
    estimatedDamage,

    favoriteChampionId: favoriteChampion?.[0] ?? null,
    favoriteChampionCount: favoriteChampion?.[1] ?? 0,

    mostUsedItemId: mostUsedItem?.[0] ?? null,
    mostUsedItemCount: mostUsedItem?.[1] ?? 0,

    mostUsedTraitId: mostUsedTrait?.[0] ?? null,
    mostUsedTraitCount: mostUsedTrait?.[1] ?? 0,
  };
}

function calculateTopComps(matches: TftMatch[]) {
  const compMap: Record<
    string,
    {
      games: number;
      placements: number[];
      traitIds: string[];
      unitIds: string[];
    }
  > = {};

  matches.forEach((match) => {
    const comp = buildCompSignature(match);

    if (!compMap[comp.key]) {
      compMap[comp.key] = {
        games: 0,
        placements: [],
        traitIds: comp.traitIds,
        unitIds: comp.unitIds,
      };
    }

    compMap[comp.key].games += 1;
    compMap[comp.key].placements.push(match.placement ?? 8);
  });

  return Object.entries(compMap)
    .map(([key, value]) => ({
      key,
      games: value.games,
      avgPlacement: Number(average(value.placements).toFixed(2)),
      top4Rate: Number(
        percentage(
          value.placements.filter((placement) => placement <= 4).length,
          value.games
        ).toFixed(1)
      ),
      winRate: Number(
        percentage(
          value.placements.filter((placement) => placement === 1).length,
          value.games
        ).toFixed(1)
      ),
      traitIds: value.traitIds,
      unitIds: value.unitIds,
    }))
    .sort((a, b) => {
      if (b.games !== a.games) return b.games - a.games;
      return a.avgPlacement - b.avgPlacement;
    })
    .slice(0, 3);
}

function calculateTopItems(matches: TftMatch[]) {
  const itemMap: Record<string, { games: number; placements: number[] }> = {};

  matches.forEach((match) => {
    const seen = new Set<string>();

    match.units.forEach((unit) => {
      unit.itemNames?.forEach((item) => {
        if (item) seen.add(item);
      });
    });

    seen.forEach((item) => {
      if (!itemMap[item]) {
        itemMap[item] = {
          games: 0,
          placements: [],
        };
      }

      itemMap[item].games += 1;
      itemMap[item].placements.push(match.placement ?? 8);
    });
  });

  return Object.entries(itemMap)
    .map(([itemId, value]) => ({
      itemId,
      games: value.games,
      top4Rate: Number(
        percentage(
          value.placements.filter((placement) => placement <= 4).length,
          value.games
        ).toFixed(1)
      ),
      avgPlacement: Number(average(value.placements).toFixed(2)),
    }))
    .sort((a, b) => {
      if (b.games !== a.games) return b.games - a.games;
      return a.avgPlacement - b.avgPlacement;
    })
    .slice(0, 3);
}

function calculateTopChampions(matches: TftMatch[]) {
  const championMap: Record<string, { games: number; placements: number[] }> = {};

  matches.forEach((match) => {
    const seen = new Set<string>();

    match.units.forEach((unit) => {
      if (unit.characterId) {
        seen.add(unit.characterId);
      }
    });

    seen.forEach((championId) => {
      if (!championMap[championId]) {
        championMap[championId] = {
          games: 0,
          placements: [],
        };
      }

      championMap[championId].games += 1;
      championMap[championId].placements.push(match.placement ?? 8);
    });
  });

  return Object.entries(championMap)
    .map(([championId, value]) => ({
      championId,
      games: value.games,
      top4Rate: Number(
        percentage(
          value.placements.filter((placement) => placement <= 4).length,
          value.games
        ).toFixed(1)
      ),
      avgPlacement: Number(average(value.placements).toFixed(2)),
    }))
    .sort((a, b) => {
      if (b.games !== a.games) return b.games - a.games;
      return a.avgPlacement - b.avgPlacement;
    })
    .slice(0, 6);
}

function calculateTrend(matches: TftMatch[]) {
  return [...matches]
    .sort((a, b) => (b.gameDatetime ?? 0) - (a.gameDatetime ?? 0))
    .slice(0, 10)
    .map((match) => ({
      matchId: match.matchId,
      placement: match.placement ?? 8,
      isTop4: (match.placement ?? 8) <= 4,
      isWin: (match.placement ?? 8) === 1,
    }));
}

export function buildTftPerformanceSummary(matches: TftMatch[]) {
  const queueBuckets = {
    all: matches,
    ranked: matches.filter((match) => getQueueKey(match.queueId) === "ranked"),
    normal: matches.filter((match) => getQueueKey(match.queueId) === "normal"),
    hyper_roll: matches.filter((match) => getQueueKey(match.queueId) === "hyper_roll"),
    double_up: matches.filter((match) => getQueueKey(match.queueId) === "double_up"),
  };

  return {
    all: {
      overview: calculateOverview(queueBuckets.all),
      topComps: calculateTopComps(queueBuckets.all),
      topItems: calculateTopItems(queueBuckets.all),
      topChampions: calculateTopChampions(queueBuckets.all),
      trend: calculateTrend(queueBuckets.all),
    },
    ranked: {
      overview: calculateOverview(queueBuckets.ranked),
      topComps: calculateTopComps(queueBuckets.ranked),
      topItems: calculateTopItems(queueBuckets.ranked),
      topChampions: calculateTopChampions(queueBuckets.ranked),
      trend: calculateTrend(queueBuckets.ranked),
    },
    normal: {
      overview: calculateOverview(queueBuckets.normal),
      topComps: calculateTopComps(queueBuckets.normal),
      topItems: calculateTopItems(queueBuckets.normal),
      topChampions: calculateTopChampions(queueBuckets.normal),
      trend: calculateTrend(queueBuckets.normal),
    },
    hyper_roll: {
      overview: calculateOverview(queueBuckets.hyper_roll),
      topComps: calculateTopComps(queueBuckets.hyper_roll),
      topItems: calculateTopItems(queueBuckets.hyper_roll),
      topChampions: calculateTopChampions(queueBuckets.hyper_roll),
      trend: calculateTrend(queueBuckets.hyper_roll),
    },
    double_up: {
      overview: calculateOverview(queueBuckets.double_up),
      topComps: calculateTopComps(queueBuckets.double_up),
      topItems: calculateTopItems(queueBuckets.double_up),
      topChampions: calculateTopChampions(queueBuckets.double_up),
      trend: calculateTrend(queueBuckets.double_up),
    },
  };
}