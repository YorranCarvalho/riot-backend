import { RiotLeagueEntry } from "../types/riot.types";
import { RankedQueue } from "../types/scout.types";

export function mapRankedQueue(
  entry: RiotLeagueEntry | null,
  currentSeason: string
): RankedQueue {
  if (!entry) {
    return {
      currentTier: "RANK_UNAVAILABLE",
      currentLp: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      seasons: [
        {
          season: currentSeason,
          tier: "RANK_UNAVAILABLE",
          lp: 0,
        },
      ],
    };
  }

  const totalGames = entry.wins + entry.losses;
  const winRate = totalGames > 0 ? (entry.wins / totalGames) * 100 : 0;

  return {
    currentTier: `${entry.tier} ${entry.rank}`,
    currentLp: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses,
    winRate: Number(winRate.toFixed(2)),
    seasons: [
      {
        season: currentSeason,
        tier: `${entry.tier} ${entry.rank}`,
        lp: entry.leaguePoints,
      },
    ],
  };
}