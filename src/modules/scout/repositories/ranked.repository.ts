import { prisma } from "../../../lib/prisma";

export class RankedRepository {
  async replacePlayerSeasonSnapshots(
    playerId: string,
    season: string,
    entries: Array<{
      queueType: string;
      tier: string;
      rank: string;
      leaguePoints: number;
      wins: number;
      losses: number;
      winRate: number;
    }>
  ) {
    await prisma.rankedSnapshot.deleteMany({
      where: { playerId, season },
    });

    if (!entries.length) return;

    await prisma.rankedSnapshot.createMany({
      data: entries.map((entry) => ({
        playerId,
        season,
        ...entry,
      })),
    });
  }

  async findLatestByPlayerId(playerId: string) {
    return prisma.rankedSnapshot.findMany({
      where: { playerId },
      orderBy: { capturedAt: "desc" },
    });
  }
}