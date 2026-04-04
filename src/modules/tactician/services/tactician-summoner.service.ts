import axios from "axios";
import { env } from "../../../config/env";

export class TacticianSummonerService {
  async execute(puuid: string) {
    const url = `https://${env.RIOT_PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;

    const response = await axios.get(url, {
      headers: {
        "X-Riot-Token": env.RIOT_API_KEY,
      },
    });

    return response.data;
  }
}