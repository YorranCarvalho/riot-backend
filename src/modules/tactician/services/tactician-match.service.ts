import axios from "axios";
import { env } from "../../../config/env";

type GetMatchesByPuuidInput = {
  puuid: string;
  start?: number;
  count?: number;
};

export class TacticianMatchService {
  async getMatchIds(puuid: string, start = 0, count = 10) {
    const response = await axios.get(
      `https://${env.RIOT_REGION}.api.riotgames.com/tft/match/v1/matches/by-puuid/${encodeURIComponent(puuid)}/ids`,
      {
        headers: {
          "X-Riot-Token": env.RIOT_API_KEY,
        },
        params: { start, count },
      }
    );

    return response.data;
  }

  async getMatch(matchId: string) {
    const response = await axios.get(
      `https://${env.RIOT_REGION}.api.riotgames.com/tft/match/v1/matches/${encodeURIComponent(matchId)}`,
      {
        headers: {
          "X-Riot-Token": env.RIOT_API_KEY,
        },
      }
    );

    return response.data;
  }

  async getMatchesByPuuid({
    puuid,
    start = 0,
    count = 10,
  }: GetMatchesByPuuidInput) {
    const matchIds = await this.getMatchIds(puuid, start, count);

    const matches = await Promise.all(
      matchIds.map((matchId: string) => this.getMatch(matchId))
    );

    return matches;
  }
}