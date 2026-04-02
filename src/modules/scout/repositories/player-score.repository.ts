import { prisma } from "../../../lib/prisma";

export class PlayerScoreRepository {
  async upsert(data: {
    playerId: string;
    performanceScore: number;
    kdaScore: number;
    csScore: number;
    damageScore: number;
    goldScore: number;
    visionScore: number;
    winRateScore: number;
    deathScore: number;
    consistencyScore: number;
  }) {
    return prisma.playerScore.upsert({
      where: { playerId: data.playerId },
      update: data,
      create: data,
    });
  }

  async findByPlayerId(playerId: string) {
    return prisma.playerScore.findUnique({
      where: { playerId },
    });
  }
}