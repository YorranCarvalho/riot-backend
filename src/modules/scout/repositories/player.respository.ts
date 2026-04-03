import { prisma } from "../../../lib/prisma";

export class PlayerRepository {
  async findByPuuid(puuid: string) {
    return prisma.player.findUnique({
      where: { puuid },
    });
  }

  async findByRiotId(gameName: string, tagLine: string) {
    return prisma.player.findFirst({
      where: {
        gameName: {
          equals: gameName,
          mode: "insensitive",
        },
        tagLine: {
          equals: tagLine,
          mode: "insensitive",
        },
      },
    });
  }

  async upsert(data: {
    puuid: string;
    gameName: string;
    tagLine: string;
    profileIconId: number;
    summonerLevel: number;
    summonerId?: string | null;
    accountId?: string | null;
    region: string;
  }) {
    return prisma.player.upsert({
      where: { puuid: data.puuid },
      update: {
        puuid: data.puuid,
        gameName: data.gameName,
        tagLine: data.tagLine,
        profileIconId: data.profileIconId,
        summonerLevel: data.summonerLevel,
        summonerId: data.summonerId ?? null,
        accountId: data.accountId ?? null,
        region: data.region,
      },
      create: {
        puuid: data.puuid,
        gameName: data.gameName,
        tagLine: data.tagLine,
        profileIconId: data.profileIconId,
        summonerLevel: data.summonerLevel,
        summonerId: data.summonerId ?? null,
        accountId: data.accountId ?? null,
        region: data.region,
      },
    });
  }
}