import { RiotMatchService } from "./riot-match.service";
import { normalizeRole } from "../utils/role.util";
import { MatchDetailsDto } from "../dto/match-details.dto";

export class ScoutMatchDetailsService {
  private riotMatchService = new RiotMatchService();

  async execute({ matchId, puuid }: { matchId: string; puuid: string }): Promise<MatchDetailsDto> {
    const match = await this.riotMatchService.getMatchById(matchId);

    const minutes = Math.max(1, match.info.gameDuration / 60);

    const mappedParticipants = match.info.participants.map((participant) => {
      const farm =
        (participant.totalMinionsKilled || 0) +
        (participant.neutralMinionsKilled || 0);

      return {
        puuid: participant.puuid,
        summonerName: participant.summonerName,
        riotIdGameName: participant.riotIdGameName,
        riotIdTagline: participant.riotIdTagline,
        championName: participant.championName,
        teamId: participant.teamId,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        kda: Number(
          (
            (participant.kills + participant.assists) /
            Math.max(1, participant.deaths)
          ).toFixed(2)
        ),
        win: participant.win,
        role: normalizeRole(participant.teamPosition, participant.lane),
        farm,
        csPerMin: Number((farm / minutes).toFixed(2)),
        goldEarned: participant.goldEarned,
        goldPerMin: Number((participant.goldEarned / minutes).toFixed(2)),
        damage: participant.totalDamageDealtToChampions,
        damagePerMin: Number(
          (participant.totalDamageDealtToChampions / minutes).toFixed(2)
        ),
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
        champLevel: participant.champLevel,
      };
    });

    const player = mappedParticipants.find((participant) => participant.puuid === puuid);

    if (!player) {
      throw new Error("Jogador não encontrado nesta partida.");
    }

    const blueParticipants = mappedParticipants.filter((participant) => participant.teamId === 100);
    const redParticipants = mappedParticipants.filter((participant) => participant.teamId === 200);

    return {
      matchId: match.metadata.matchId,
      queueId: match.info.queueId,
      gameCreation: match.info.gameCreation,
      gameDuration: match.info.gameDuration,
      targetPlayerPuuid: puuid,
      targetPlayerTeamId: player.teamId,
      player,
      blueTeam: {
        teamId: 100,
        win: blueParticipants.some((participant) => participant.win),
        participants: blueParticipants,
      },
      redTeam: {
        teamId: 200,
        win: redParticipants.some((participant) => participant.win),
        participants: redParticipants,
      },
    };
  }
}