import axios from "axios";
import { env } from "../../../config/env";

export class TacticianSummonerService {
  async execute(puuid: string) {
    const response = await axios.get(
      `https://${env.RIOT_PLATFORM}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${encodeURIComponent(puuid)}`,
      {
        headers: {
          "X-Riot-Token": env.RIOT_API_KEY,
        },
      }
    );

    return response.data;
  }
}