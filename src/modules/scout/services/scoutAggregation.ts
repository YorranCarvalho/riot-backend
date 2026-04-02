
import {
  ChampionPoolEntry,
  MatchScoutStats,
  AggregatedScoutStats,
  ScoutTrends,
} from "../types/scout.types";
import { average } from "../utils/scoutMatch";

export function aggregateMatches(
  matches: MatchScoutStats[]
): AggregatedScoutStats {
  const games = matches.length || 1;
  const wins = matches.filter((match) => match.win).length;
  const losses = games - wins;

  const kills = average(matches.map((match) => match.kills));
  const deaths = average(matches.map((match) => match.deaths));
  const assists = average(matches.map((match) => match.assists));

  return {
    games,
    wins,
    losses,
    winRate: (wins / games) * 100,
    kills,
    deaths,
    assists,
    kda: (kills + assists) / Math.max(1, deaths),
    csPerMin: average(matches.map((match) => match.csPerMin)),
    damagePerMin: average(matches.map((match) => match.damagePerMin)),
    goldPerMin: average(matches.map((match) => match.goldPerMin)),
    visionPerMin: average(matches.map((match) => match.visionPerMin ?? 0)),
    killParticipation: average(
      matches.map((match) => match.killParticipation ?? 0)
    ),
    gameDurationAvg: average(matches.map((match) => match.gameDuration)),
  };
}

export function getPrimaryRole(matches: MatchScoutStats[]) {
  const roleCount = matches.reduce<Record<string, number>>((acc, match) => {
    acc[match.role] = (acc[match.role] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(roleCount).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "UNKNOWN";
}

export function buildChampionPool(
  matches: MatchScoutStats[]
): ChampionPoolEntry[] {
  const grouped = matches.reduce<Record<string, MatchScoutStats[]>>(
    (acc, match) => {
      if (!acc[match.championName]) acc[match.championName] = [];
      acc[match.championName].push(match);
      return acc;
    },
    {}
  );

  return Object.entries(grouped)
    .map(([championName, champMatches]) => {
      const games = champMatches.length;
      const wins = champMatches.filter((match) => match.win).length;
      const losses = games - wins;

      const recentHalf = champMatches.slice(0, Math.ceil(champMatches.length / 2));
      const olderHalf = champMatches.slice(Math.ceil(champMatches.length / 2));

      const recentWr = recentHalf.length
        ? (recentHalf.filter((match) => match.win).length / recentHalf.length) *
          100
        : 0;

      const olderWr = olderHalf.length
        ? (olderHalf.filter((match) => match.win).length / olderHalf.length) *
          100
        : 0;

      let trend: "up" | "stable" | "down" = "stable";
      if (recentWr - olderWr >= 10) trend = "up";
      if (olderWr - recentWr >= 10) trend = "down";

      return {
        championName,
        games,
        wins,
        losses,
        winRate: games ? (wins / games) * 100 : 0,
        averageKda: average(champMatches.map((match) => match.kda)),
        avgCsPerMin: average(champMatches.map((match) => match.csPerMin)),
        avgDamagePerMin: average(
          champMatches.map((match) => match.damagePerMin)
        ),
        trend,
      };
    })
    .sort((a, b) => b.games - a.games);
}

export function buildScoutTrends(matches: MatchScoutStats[]): ScoutTrends {
  const last10 = matches.slice(0, 10);
  const last20 = matches.slice(0, 20);

  const last10WinRate = last10.length
    ? (last10.filter((match) => match.win).length / last10.length) * 100
    : 0;

  const last20WinRate = last20.length
    ? (last20.filter((match) => match.win).length / last20.length) * 100
    : 0;

  const recentTrend: "up" | "stable" | "down" =
    last10WinRate > last20WinRate + 5
      ? "up"
      : last10WinRate < last20WinRate - 5
      ? "down"
      : "stable";

  let streakType: "win" | "loss" | "none" = "none";
  let streakCount = 0;

  for (const match of matches) {
    const currentType = match.win ? "win" : "loss";

    if (streakType === "none") {
      streakType = currentType;
      streakCount = 1;
      continue;
    }

    if (currentType === streakType) {
      streakCount++;
    } else {
      break;
    }
  }

  return {
    last10WinRate,
    last20WinRate,
    recentTrend,
    streak: {
      type: streakType,
      count: streakCount,
    },
  };
}