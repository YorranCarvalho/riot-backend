import { RankedRepository } from "../repositories/ranked.repository";
import { MasteryRepository } from "../repositories/mastery.repository";
import { MatchRepository } from "../repositories/match.repository";
import { mapRankedQueue } from "../mappers/riot-ranked.mapper";
import { buildScoutTraits } from "../utils/buildScoutTraits";
import { ScoutRefreshService } from "./scout-refresh.service";
import { ScoutProfileDto } from "../dto/scout-profile.dto";
import { PlayerScoreRepository } from "../repositories/player-score.repository";
import { getCurrentSeasonLabel } from "../utils/season.util";
import { PlayerRepository } from "../repositories/player.respository";
import { ScoutProfileRepository } from "../repositories/scout.profile.repository";
import { buildScoutProfile } from "./buildScoutProfile";

export class ScoutProfileService {
  private playerRepository = new PlayerRepository();
  private rankedRepository = new RankedRepository();
  private masteryRepository = new MasteryRepository();
  private matchRepository = new MatchRepository();
  private scoutProfileRepository = new ScoutProfileRepository();
  private playerScoreRepository = new PlayerScoreRepository();
  private scoutRefreshService = new ScoutRefreshService();

  async execute({
    name,
    tag,
  }: {
    name: string;
    tag: string;
  }): Promise<ScoutProfileDto> {
    let player = await this.playerRepository.findByRiotId(name, tag);

    if (!player) {
      const refreshed = await this.scoutRefreshService.execute({ name, tag });
      player = await this.playerRepository.findByPuuid(refreshed.puuid);
    }

    if (!player) {
      throw new Error("Player não encontrado.");
    }

    const [
      rankedSnapshots,
      masteries,
      recentMatchesDb,
      scoutProfile,
      playerScore,
    ] = await Promise.all([
      this.rankedRepository.findLatestByPlayerId(player.id),
      this.masteryRepository.findTopByPlayerId(player.id, 5),
      this.matchRepository.findRecentByPlayerId(player.id, 10),
      this.scoutProfileRepository.findByPlayerId(player.id),
      this.playerScoreRepository.findByPlayerId(player.id),
    ]);

    const currentSeason = getCurrentSeasonLabel();

    const soloEntry =
      rankedSnapshots.find(
        (entry) => entry.queueType === "RANKED_SOLO_5x5"
      ) || null;

    const flexEntry =
      rankedSnapshots.find(
        (entry) => entry.queueType === "RANKED_FLEX_SR"
      ) || null;

    const ranked = {
      soloDuo: mapRankedQueue(
        soloEntry
          ? {
              queueType: soloEntry.queueType,
              tier: soloEntry.tier,
              rank: soloEntry.rank,
              leaguePoints: soloEntry.leaguePoints,
              wins: soloEntry.wins,
              losses: soloEntry.losses,
            }
          : null,
        currentSeason
      ),
      flex: mapRankedQueue(
        flexEntry
          ? {
              queueType: flexEntry.queueType,
              tier: flexEntry.tier,
              rank: flexEntry.rank,
              leaguePoints: flexEntry.leaguePoints,
              wins: flexEntry.wins,
              losses: flexEntry.losses,
            }
          : null,
        currentSeason
      ),
    };

    const recentMatches = recentMatchesDb.map((match) => ({
      matchId: match.matchId,
      gameCreation: match.match.gameCreation.getTime(),
      gameDuration: match.match.gameDuration,
      queueId: match.match.queueId,
      championName: match.championName,
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      kda: match.kda,
      win: match.win,
      role: match.role,
      farm: match.totalCs,
      csPerMin: match.csPerMin,
      goldEarned: match.goldEarned,
      goldPerMin: match.goldPerMin,
      damage: match.damageToChampions,
      damagePerMin: match.damagePerMin,
      items: [
        match.item0,
        match.item1,
        match.item2,
        match.item3,
        match.item4,
        match.item5,
        match.item6,
      ],
      summonerSpells: [match.summoner1Id, match.summoner2Id],
    }));

    const traits = buildScoutTraits(recentMatches);
    
    return buildScoutProfile({
      basic: {
        puuid: player.puuid,
        name: player.gameName,
        tag: player.tagLine,
        profileIconId: player.profileIconId,
        level: player.summonerLevel,
      },
      ranked,
      mastery: masteries.map((mastery) => ({
        championId: mastery.championId,
        championLevel: mastery.championLevel,
        championPoints: mastery.championPoints,
      })),
      stats: {
        wins: scoutProfile?.winsLast10 ?? 0,
        losses: scoutProfile?.lossesLast10 ?? 0,
        averageKda: scoutProfile?.averageKdaLast10 ?? 0,
        averageCsPerMin: scoutProfile?.averageCsPerMinLast10 ?? 0,
        averageDamagePerMin: scoutProfile?.averageDpmLast10 ?? 0,
        averageGoldPerMin: scoutProfile?.averageGpmLast10 ?? 0,
        mostPlayedRole: scoutProfile?.mostPlayedRole ?? "UNKNOWN",
      },
      scores: {
        performanceScore: playerScore?.performanceScore ?? 0,
        kdaScore: playerScore?.kdaScore ?? 0,
        csScore: playerScore?.csScore ?? 0,
        damageScore: playerScore?.damageScore ?? 0,
        goldScore: playerScore?.goldScore ?? 0,
        visionScore: playerScore?.visionScore ?? 0,
        winRateScore: playerScore?.winRateScore ?? 0,
        deathScore: playerScore?.deathScore ?? 0,
        consistencyScore: playerScore?.consistencyScore ?? 0,
      },
      recentMatches,
      traits,
    });
  }
}