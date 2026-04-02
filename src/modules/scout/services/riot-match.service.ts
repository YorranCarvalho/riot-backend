import { riotApi } from "../../../lib/riot";
import { RiotMatchResponse } from "../types/riot.types";
import { runInBatches } from "../utils/batch.util";

export class RiotMatchService {
  async getMatchIdsByPuuid(puuid: string, count = 10) {
    const response = await riotApi.get<string[]>(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`
    );

    return response.data ?? [];
  }

  async getMatchById(matchId: string) {
    const response = await riotApi.get<RiotMatchResponse>(
      `https://americas.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`
    );

    return response.data;
  }

  async getMatchesByIds(matchIds: string[]) {
    return runInBatches(matchIds, 3, async (matchId) => this.getMatchById(matchId));
  }
}