import axios from "axios";
import { env } from "../../../config/env";

export class TacticianMatchService {
  async getMatchIds(puuid: string, count = 10) {
    const response = await axios.get(
      `https://${env.RIOT_REGION}.api.riotgames.com/tft/match/v1/matches/by-puuid/${encodeURIComponent(puuid)}/ids`,
      {
        headers: {
          "X-Riot-Token": env.RIOT_API_KEY,
        },
        params: { count },
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
}