import { prisma } from "../../../lib/prisma";

export class MatchRepository {
  async upsertMatch(data: {
    id: string;
    queueId: number;
    gameCreation: Date;
    gameDuration: number;
    gameVersion?: string | null;
    mapId?: number | null;
    platformId?: string | null;
  }) {
    return prisma.match.upsert({
      where: { id: data.id },
      update: {
        queueId: data.queueId,
        gameCreation: data.gameCreation,
        gameDuration: data.gameDuration,
        gameVersion: data.gameVersion ?? null,
        mapId: data.mapId ?? null,
        platformId: data.platformId ?? null,
      },
      create: {
        id: data.id,
        queueId: data.queueId,
        gameCreation: data.gameCreation,
        gameDuration: data.gameDuration,
        gameVersion: data.gameVersion ?? null,
        mapId: data.mapId ?? null,
        platformId: data.platformId ?? null,
      },
    });
  }

  async upsertPlayerMatch(data: {
    playerId: string;
    matchId: string;
    puuid: string;
    summonerName?: string | null;
    riotIdGameName?: string | null;
    riotIdTagLine?: string | null;
    championName: string;
    championId?: number | null;
    teamId: number;
    role: string;
    lane?: string | null;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    totalCs: number;
    csPerMin: number;
    goldEarned: number;
    goldPerMin: number;
    damageToChampions: number;
    damagePerMin: number;
    visionScore?: number | null;
    visionPerMin?: number | null;
    champLevel: number;
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;
    summoner1Id: number;
    summoner2Id: number;
  }) {
    return prisma.playerMatch.upsert({
      where: {
        playerId_matchId: {
          playerId: data.playerId,
          matchId: data.matchId,
        },
      },
      update: data,
      create: data,
    });
  }

  async findRecentByPlayerId(playerId: string, take = 10) {
    return prisma.playerMatch.findMany({
      where: { playerId },
      include: { match: true },
      orderBy: { match: { gameCreation: "desc" } },
      take,
    });
  }

  async findPaginatedByPlayerId(playerId: string, page = 1, limit = 10) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (safePage - 1) * safeLimit;

    const [matches, total] = await Promise.all([
      prisma.playerMatch.findMany({
        where: { playerId },
        include: { match: true },
        orderBy: { match: { gameCreation: "desc" } },
        skip,
        take: safeLimit,
      }),
      prisma.playerMatch.count({
        where: { playerId },
      }),
    ]);

    return {
      matches,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
      hasNextPage: skip + matches.length < total,
      hasPreviousPage: safePage > 1,
    };
  }

  async findAllByPlayerId(playerId: string) {
    return prisma.playerMatch.findMany({
      where: { playerId },
      include: { match: true },
      orderBy: { match: { gameCreation: "desc" } },
    });
  }
}