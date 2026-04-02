import { RankedResponse, RecentMatch, ScoutTrait } from "../types/scout.types";

export type ScoutProfileDto = {
  basic: {
    puuid: string;
    name: string;
    tag: string;
    profileIconId: number;
    level: number;
  };
  ranked: RankedResponse;
  mastery: Array<{
    championId: number;
    championLevel: number;
    championPoints: number;
  }>;
  stats: {
    wins: number;
    losses: number;
    averageKda: number;
    averageCsPerMin: number;
    averageDamagePerMin: number;
    averageGoldPerMin: number;
    mostPlayedRole: string;
  };
  scores: {
    performanceScore: number;
    kdaScore: number;
    csScore: number;
    damageScore: number;
    goldScore: number;
    visionScore: number;
    winRateScore: number;
    deathScore: number;
    consistencyScore: number;
  };
  championPool: Array<{
    championName: string;
    games: number;
    wins: number;
    losses: number;
    winRate: number;
    averageKda: number;
  }>;
  recentMatches: RecentMatch[];
  traits: ScoutTrait[];
};