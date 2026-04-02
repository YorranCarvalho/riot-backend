export type RankedSeason = {
  season: string;
  tier: string;
  lp: number;
};

export type RankedQueue = {
  currentTier: string;
  currentLp: number;
  wins: number;
  losses: number;
  winRate: number;
  seasons: RankedSeason[];
};

export type RankedResponse = {
  soloDuo: RankedQueue;
  flex: RankedQueue;
};

export type ScoutTrait = {
  key: string;
  label: string;
  color: "red" | "green" | "yellow" | "blue" | "purple" | "pink";
  description: string;
};

export type RecentMatch = {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  queueId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  win: boolean;
  role: string;
  farm: number;
  csPerMin: number;
  goldEarned: number;
  goldPerMin: number;
  damage: number;
  damagePerMin: number;
  items: number[];
  summonerSpells: number[];
};

export interface MatchScoutStats {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  queueId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  win: boolean;
  role: string;
  farm: number;
  csPerMin: number;
  goldEarned: number;
  goldPerMin: number;
  damage: number;
  damagePerMin: number;
  items: number[];
  summonerSpells: number[];
  visionScore?: number;
  visionPerMin?: number;
  killParticipation?: number;
  performanceScore?: number;
  performanceLabel?: "Great" | "Good" | "Average" | "Poor";
}

export interface AggregatedScoutStats {
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  csPerMin: number;
  damagePerMin: number;
  goldPerMin: number;
  visionPerMin: number;
  killParticipation: number;
  gameDurationAvg: number;
}

export interface ChampionPoolEntry {
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKda: number;
  avgCsPerMin?: number;
  avgDamagePerMin?: number;
  trend?: "up" | "stable" | "down";
}

export interface ScoutScores {
  recentForm: number;
  mechanics: number;
  consistency: number;
  championPool: number;
  roleConfidence: number;
  riskControl: number;
  scoutScore: number;
}

export interface ScoutOverview {
  scoutScore: number;
  scoutTier: "Elite" | "Strong" | "Good" | "Average" | "Risky";
  verdict: string;
  primaryRole: string;
  sampleSize: number;
  tags: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface ScoutTrends {
  last10WinRate: number;
  last20WinRate: number;
  recentTrend: "up" | "stable" | "down";
  streak: {
    type: "win" | "loss" | "none";
    count: number;
  };
}