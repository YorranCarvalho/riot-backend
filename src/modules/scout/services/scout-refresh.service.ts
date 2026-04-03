import { MasteryRepository } from "../repositories/mastery.repository";
import { MatchRepository } from "../repositories/match.repository";
import { RankedRepository } from "../repositories/ranked.repository";
import { getCurrentSeasonLabel } from "../utils/season.util";
import { RiotAccountService } from "./riot-account.service";
import { RiotMatchService } from "./riot-match.service";
import { RiotProfileService } from "./riot-profile.service";
import { mapRiotParticipantToPlayerMatchCreate } from "../mappers/riot-match.mapper";
import { average } from "../utils/math.util";
import { normalizeRole } from "../utils/role.util";
import { PlayerPerformanceScoreService } from "./player-performance-score.service";
import { ScoutProfileRepository } from "../repositories/scout.profile.repository";
import { PlayerRepository } from "../repositories/player.respository";

export class ScoutRefreshService {
  private playerRepository = new PlayerRepository();
  private rankedRepository = new RankedRepository();
  private masteryRepository = new MasteryRepository();
  private matchRepository = new MatchRepository();
  private scoutProfileRepository = new ScoutProfileRepository();
  private playerPerformanceScoreService = new PlayerPerformanceScoreService();

  private riotAccountService = new RiotAccountService();
  private riotProfileService = new RiotProfileService();
  private riotMatchService = new RiotMatchService();

  async execute({ name, tag }: { name: string; tag: string }) {
    const account = await this.riotAccountService.getByRiotId(name, tag);
    const summoner = await this.riotProfileService.getSummonerByPuuid(account.puuid);

    const player = await this.playerRepository.upsert({
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      profileIconId: summoner.profileIconId,
      summonerLevel: summoner.summonerLevel,
      summonerId: summoner.id ?? null,
      accountId: summoner.accountId ?? null,
      region: "br1",
    });

    const [leagueEntries, championMasteries, matchIds] = await Promise.all([
      summoner.id
        ? this.riotProfileService.getLeagueEntriesBySummonerId(summoner.id)
        : Promise.resolve([]),
      this.riotProfileService.getChampionMasteryByPuuid(account.puuid),
      this.riotMatchService.getMatchIdsByPuuid(account.puuid, 20, 0),
    ]);

    const currentSeason = getCurrentSeasonLabel();

    await this.rankedRepository.replacePlayerSeasonSnapshots(
      player.id,
      currentSeason,
      leagueEntries.map((entry) => {
        const totalGames = entry.wins + entry.losses;
        const winRate = totalGames > 0 ? (entry.wins / totalGames) * 100 : 0;

        return {
          queueType: entry.queueType,
          tier: entry.tier,
          rank: entry.rank,
          leaguePoints: entry.leaguePoints,
          wins: entry.wins,
          losses: entry.losses,
          winRate: Number(winRate.toFixed(2)),
        };
      })
    );

    await this.masteryRepository.replacePlayerMasteries(
      player.id,
      championMasteries.map((mastery) => ({
        championId: mastery.championId,
        championLevel: mastery.championLevel,
        championPoints: mastery.championPoints,
        lastPlayTime: mastery.lastPlayTime ? new Date(mastery.lastPlayTime) : null,
      }))
    );

    const matches = await this.riotMatchService.getMatchesByIds(matchIds);

    for (const match of matches) {
      await this.matchRepository.upsertMatch({
        id: match.metadata.matchId,
        queueId: match.info.queueId,
        gameCreation: new Date(match.info.gameCreation),
        gameDuration: match.info.gameDuration,
        gameVersion: match.info.gameVersion ?? null,
        mapId: match.info.mapId ?? null,
        platformId: match.info.platformId ?? null,
      });

      const participant = match.info.participants.find(
        (item) => item.puuid === account.puuid
      );

      if (!participant) continue;

      await this.matchRepository.upsertPlayerMatch(
        mapRiotParticipantToPlayerMatchCreate(participant, match, player.id)
      );
    }

    const recentStoredMatches = await this.matchRepository.findRecentByPlayerId(
      player.id,
      10
    );

    const winsLast10 = recentStoredMatches.filter((match) => match.win).length;
    const lossesLast10 = recentStoredMatches.length - winsLast10;

    const averageKdaLast10 = average(recentStoredMatches.map((match) => match.kda));
    const averageCsPerMinLast10 = average(
      recentStoredMatches.map((match) => match.csPerMin)
    );
    const averageDpmLast10 = average(
      recentStoredMatches.map((match) => match.damagePerMin)
    );
    const averageGpmLast10 = average(
      recentStoredMatches.map((match) => match.goldPerMin)
    );

    const roleCounter = recentStoredMatches.reduce<Record<string, number>>(
      (acc, match) => {
        const role = normalizeRole(match.role, match.lane ?? undefined);
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {}
    );

    const mostPlayedRole =
      Object.entries(roleCounter).sort((a, b) => b[1] - a[1])[0]?.[0] || "UNKNOWN";

    const championPoolSize = new Set(
      recentStoredMatches.map((match) => match.championName)
    ).size;

    await this.scoutProfileRepository.upsert({
      playerId: player.id,
      winsLast10,
      lossesLast10,
      averageKdaLast10: Number(averageKdaLast10.toFixed(2)),
      averageCsPerMinLast10: Number(averageCsPerMinLast10.toFixed(2)),
      averageDpmLast10: Number(averageDpmLast10.toFixed(2)),
      averageGpmLast10: Number(averageGpmLast10.toFixed(2)),
      mostPlayedRole,
      championPoolSize,
    });

    await this.playerPerformanceScoreService.execute(player.id);

    return player;
  }
}