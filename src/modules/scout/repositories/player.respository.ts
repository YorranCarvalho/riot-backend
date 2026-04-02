import { prisma } from "../../../lib/prisma";

export class PlayerRepository {
  async upsert(data: {
    puuid: string;
    gameName: string;
    tagLine: string;
    profileIconId: number;
    summonerLevel: number;
    summonerId?: string;
    accountId?: string;
    region?: string;
  }) {
    return prisma.player.upsert({
      where: { puuid: data.puuid },
      update: {
        gameName: data.gameName,
        tagLine: data.tagLine,
        profileIconId: data.profileIconId,
        summonerLevel: data.summonerLevel,
        summonerId: data.summonerId,
        accountId: data.accountId,
        region: data.region ?? "br1",
      },
      create: {
        puuid: data.puuid,
        gameName: data.gameName,
        tagLine: data.tagLine,
        profileIconId: data.profileIconId,
        summonerLevel: data.summonerLevel,
        summonerId: data.summonerId,
        accountId: data.accountId,
        region: data.region ?? "br1",
      },
    });
  }

  async findByPuuid(puuid: string) {
    return prisma.player.findUnique({
      where: { puuid },
    });
  }
}