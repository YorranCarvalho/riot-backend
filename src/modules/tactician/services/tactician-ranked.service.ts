import axios from "axios";
import { env } from "../../../config/env";

export class TacticianRankedService {
  async execute(summonerId: string) {
    const response = await axios.get(
      `https://${env.RIOT_PLATFORM}.api.riotgames.com/tft/league/v1/entries/by-summoner/${encodeURIComponent(summonerId)}`,
      {
        headers: {
          "X-Riot-Token": env.RIOT_API_KEY,
        },
      }
    );

    const entries = response.data ?? [];

    return entries.find((entry: any) => entry.queueType === "RANKED_TFT") || null;
  }
}