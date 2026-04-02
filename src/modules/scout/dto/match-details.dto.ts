export type MatchDetailsParticipantDto = {
  puuid: string;
  summonerName: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  championName: string;
  teamId: number;
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
  champLevel: number;
};

export type MatchDetailsTeamDto = {
  teamId: number;
  win: boolean;
  participants: MatchDetailsParticipantDto[];
};

export type MatchDetailsDto = {
  matchId: string;
  queueId: number;
  gameCreation: number;
  gameDuration: number;
  targetPlayerPuuid: string;
  targetPlayerTeamId: number;
  player: MatchDetailsParticipantDto;
  blueTeam: MatchDetailsTeamDto;
  redTeam: MatchDetailsTeamDto;
};