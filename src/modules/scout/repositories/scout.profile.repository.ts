import { prisma } from "../../../lib/prisma";

export class ScoutProfileRepository {
  async upsert(data: {
    playerId: string;
    winsLast10: number;
    lossesLast10: number;
    averageKdaLast10: number;
    averageCsPerMinLast10: number;
    averageDpmLast10: number;
    averageGpmLast10: number;
    mostPlayedRole: string;
    championPoolSize: number;
  }) {
    return prisma.scoutProfile.upsert({
      where: { playerId: data.playerId },
      update: data,
      create: data,
    });
  }

  async findByPlayerId(playerId: string) {
    return prisma.scoutProfile.findUnique({
      where: { playerId },
    });
  }
}