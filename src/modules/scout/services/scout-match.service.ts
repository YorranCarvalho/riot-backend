import { MatchRepository } from "../repositories/match.repository";
import { PlayerRepository } from "../repositories/player.respository";

export class ScoutMatchesService {
  private playerRepository = new PlayerRepository();
  private matchRepository = new MatchRepository();

  async execute({
    name,
    tag,
    page = 1,
    limit = 10,
  }: {
    name: string;
    tag: string;
    page?: number;
    limit?: number;
  }) {
    const player = await this.playerRepository.findByRiotId(name, tag);

    if (!player) {
      throw new Error("Jogador não encontrado.");
    }

    const paginated = await this.matchRepository.findPaginatedByPlayerId(
      player.id,
      page,
      limit
    );

    return {
      items: paginated.matches.map((match) => ({
        matchId: match.matchId,
        gameCreation: match.match.gameCreation,
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
        champLevel: match.champLevel,
      })),
      pagination: {
        total: paginated.total,
        page: paginated.page,
        limit: paginated.limit,
        totalPages: paginated.totalPages,
        hasNextPage: paginated.hasNextPage,
        hasPreviousPage: paginated.hasPreviousPage,
      },
    };
  }
}