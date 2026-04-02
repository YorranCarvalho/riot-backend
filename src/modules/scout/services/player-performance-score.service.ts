import { MatchRepository } from "../repositories/match.repository";
import { PlayerScoreRepository } from "../repositories/player-score.repository";
import { average } from "../utils/math.util";
import { clamp, round, standardDeviation } from "../utils/score.util";

export class PlayerPerformanceScoreService {
  private matchRepository = new MatchRepository();
  private playerScoreRepository = new PlayerScoreRepository();

  async execute(playerId: string) {
    const matches = await this.matchRepository.findRecentByPlayerId(playerId, 10);

    if (!matches.length) {
      return this.playerScoreRepository.upsert({
        playerId,
        performanceScore: 0,
        kdaScore: 0,
        csScore: 0,
        damageScore: 0,
        goldScore: 0,
        visionScore: 0,
        winRateScore: 0,
        deathScore: 0,
        consistencyScore: 0,
      });
    }

    const avgKda = average(matches.map((m) => m.kda));
    const avgCsPerMin = average(matches.map((m) => m.csPerMin));
    const avgDamagePerMin = average(matches.map((m) => m.damagePerMin));
    const avgGoldPerMin = average(matches.map((m) => m.goldPerMin));
    const avgVisionPerMin = average(matches.map((m) => m.visionPerMin ?? 0));
    const avgDeaths = average(matches.map((m) => m.deaths));
    const winRate = (matches.filter((m) => m.win).length / matches.length) * 100;
    const kdaStdDev = standardDeviation(matches.map((m) => m.kda));

    const kdaScore = clamp((avgKda / 5) * 100);
    const csScore = clamp((avgCsPerMin / 8.5) * 100);
    const damageScore = clamp((avgDamagePerMin / 900) * 100);
    const goldScore = clamp((avgGoldPerMin / 500) * 100);
    const visionScore = clamp((avgVisionPerMin / 1.5) * 100);
    const winRateScore = clamp(winRate);
    const deathScore = clamp(100 - (avgDeaths / 8) * 100);
    const consistencyScore = clamp(100 - kdaStdDev * 20);

    const performanceScore = round(
      kdaScore * 0.2 +
        csScore * 0.15 +
        damageScore * 0.2 +
        goldScore * 0.1 +
        visionScore * 0.1 +
        winRateScore * 0.1 +
        deathScore * 0.1 +
        consistencyScore * 0.05
    );
    
    return this.playerScoreRepository.upsert({
      playerId,
      performanceScore,
      kdaScore: round(kdaScore),
      csScore: round(csScore),
      damageScore: round(damageScore),
      goldScore: round(goldScore),
      visionScore: round(visionScore),
      winRateScore: round(winRateScore),
      deathScore: round(deathScore),
      consistencyScore: round(consistencyScore),
    });
    
  }
}