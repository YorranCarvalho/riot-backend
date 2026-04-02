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