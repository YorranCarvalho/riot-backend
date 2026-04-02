export type RiotAccountResponse = {
  puuid: string;
  gameName: string;
  tagLine: string;
};

export type RiotSummonerResponse = {
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
  id?: string;
  accountId?: string;
};

export type RiotLeagueEntry = {
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export type RiotChampionMastery = {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime?: number;
};

export type RiotMatchParticipant = {
  puuid: string;
  summonerName: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  championName: string;
  championId?: number;
  teamId: number;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  teamPosition: string;
  lane: string;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  visionScore?: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
  champLevel: number;
};

export type RiotMatchResponse = {
  metadata: {
    matchId: string;
  };
  info: {
    queueId: number;
    gameCreation: number;
    gameDuration: number;
    gameVersion?: string;
    mapId?: number;
    platformId?: string;
    participants: RiotMatchParticipant[];
  };
};