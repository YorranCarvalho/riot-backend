import { prisma } from "../../../lib/prisma";

export class MasteryRepository {
  async replacePlayerMasteries(
    playerId: string,
    masteries: Array<{
      championId: number;
      championLevel: number;
      championPoints: number;
      lastPlayTime?: Date | null;
    }>
  ) {
    await prisma.championMastery.deleteMany({
      where: { playerId },
    });

    if (!masteries.length) return;

    await prisma.championMastery.createMany({
      data: masteries.map((mastery) => ({
        playerId,
        championId: mastery.championId,
        championLevel: mastery.championLevel,
        championPoints: mastery.championPoints,
        lastPlayTime: mastery.lastPlayTime ?? null,
      })),
    });
  }

  async findTopByPlayerId(playerId: string, take = 5) {
    return prisma.championMastery.findMany({
      where: { playerId },
      orderBy: { championPoints: "desc" },
      take,
    });
  }
}