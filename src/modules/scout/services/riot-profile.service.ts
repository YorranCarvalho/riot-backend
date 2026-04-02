import { riotApi } from "../../../lib/riot";
import {
  RiotChampionMastery,
  RiotLeagueEntry,
  RiotSummonerResponse,
} from "../types/riot.types";

export class RiotProfileService {
  async getSummonerByPuuid(puuid: string) {
    const response = await riotApi.get<RiotSummonerResponse>(
      `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
    );

    return response.data;
  }

  async getLeagueEntriesBySummonerId(summonerId?: string) {
    if (!summonerId) return [];

    try {
      const response = await riotApi.get<RiotLeagueEntry[]>(
        `https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`
      );

      return response.data ?? [];
    } catch {
      return [];
    }
  }

  async getChampionMasteryByPuuid(puuid: string) {
    const response = await riotApi.get<RiotChampionMastery[]>(
      `https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`
    );

    return response.data ?? [];
  }
}