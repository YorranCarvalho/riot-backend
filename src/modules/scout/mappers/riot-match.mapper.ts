import { RiotMatchParticipant, RiotMatchResponse } from "../types/riot.types";
import { RecentMatch } from "../types/scout.types";
import { normalizeRole } from "../utils/role.util";

export function mapRiotParticipantToRecentMatch(
  participant: RiotMatchParticipant,
  match: RiotMatchResponse
): RecentMatch {
  const farm =
    (participant.totalMinionsKilled || 0) +
    (participant.neutralMinionsKilled || 0);

  const minutes = Math.max(1, match.info.gameDuration / 60);
  const kda = (participant.kills + participant.assists) / Math.max(1, participant.deaths);

  return {
    matchId: match.metadata.matchId,
    gameCreation: match.info.gameCreation,
    gameDuration: match.info.gameDuration,
    queueId: match.info.queueId,
    championName: participant.championName,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    kda: Number(kda.toFixed(2)),
    win: participant.win,
    role: normalizeRole(participant.teamPosition, participant.lane),
    farm,
    csPerMin: Number((farm / minutes).toFixed(2)),
    goldEarned: participant.goldEarned,
    goldPerMin: Number((participant.goldEarned / minutes).toFixed(2)),
    damage: participant.totalDamageDealtToChampions,
    damagePerMin: Number((participant.totalDamageDealtToChampions / minutes).toFixed(2)),
    items: [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5,
      participant.item6,
    ],
    summonerSpells: [participant.summoner1Id, participant.summoner2Id],
  };
}

export function mapRiotParticipantToPlayerMatchCreate(
  participant: RiotMatchParticipant,
  match: RiotMatchResponse,
  playerId: string
) {
  const totalCs =
    (participant.totalMinionsKilled || 0) +
    (participant.neutralMinionsKilled || 0);

  const minutes = Math.max(1, match.info.gameDuration / 60);
  const kda = (participant.kills + participant.assists) / Math.max(1, participant.deaths);

  return {
    playerId,
    matchId: match.metadata.matchId,
    puuid: participant.puuid,
    summonerName: participant.summonerName,
    riotIdGameName: participant.riotIdGameName ?? null,
    riotIdTagLine: participant.riotIdTagline ?? null,
    championName: participant.championName,
    championId: participant.championId ?? null,
    teamId: participant.teamId,
    role: normalizeRole(participant.teamPosition, participant.lane),
    lane: participant.lane || null,
    win: participant.win,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    kda: Number(kda.toFixed(2)),
    totalCs,
    csPerMin: Number((totalCs / minutes).toFixed(2)),
    goldEarned: participant.goldEarned,
    goldPerMin: Number((participant.goldEarned / minutes).toFixed(2)),
    damageToChampions: participant.totalDamageDealtToChampions,
    damagePerMin: Number((participant.totalDamageDealtToChampions / minutes).toFixed(2)),
    visionScore: participant.visionScore ?? null,
    visionPerMin:
      participant.visionScore != null
        ? Number((participant.visionScore / minutes).toFixed(2))
        : null,
    champLevel: participant.champLevel,
    item0: participant.item0,
    item1: participant.item1,
    item2: participant.item2,
    item3: participant.item3,
    item4: participant.item4,
    item5: participant.item5,
    item6: participant.item6,
    summoner1Id: participant.summoner1Id,
    summoner2Id: participant.summoner2Id,
  };
}