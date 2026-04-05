import axios from "axios";
import { env } from "../../../config/env";
import { TacticianSummonerService } from "./tactician-summoner.service";
import { TacticianRankedService } from "./tactician-ranked.service";
import { TacticianMatchService } from "./tactician-match.service";
import { mapTftMatch } from "../mappers/riot-tft-match.mapper";
import { buildTftPerformanceSummary } from "../utils/tft-performance.util";

interface ExecuteInput {
  gameName: string;
  tagLine: string;
}

export class TacticianProfileService {
  private tacticianSummonerService = new TacticianSummonerService();
  private tacticianRankedService = new TacticianRankedService();
  private tacticianMatchService = new TacticianMatchService();

  async execute({ gameName, tagLine }: ExecuteInput) {
    const accountResponse = await axios.get(
      `https://${env.RIOT_REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
        gameName
      )}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          "X-Riot-Token": env.RIOT_API_KEY,
        },
      }
    );

    const account = accountResponse.data;
    const puuid = account.puuid;

    const profile = await this.tacticianSummonerService.execute(puuid);

    const ranked = profile?.id
      ? await this.tacticianRankedService.execute(profile.id)
      : null;

    const matches = await this.tacticianMatchService.getMatchesByPuuid({
      puuid,
      start: 0,
      count: 10,
    });

    const recentMatches = matches
      .map((match) => mapTftMatch(match, puuid))
      .filter(Boolean);

    const performance = buildTftPerformanceSummary(recentMatches as any[]);

    return {
      account,
      profile: {
        ...profile,
        profileIconId: profile?.profileIconId ?? null,
        summonerLevel: profile?.summonerLevel ?? null,
      },
      ranked,
      performance,
      recentMatches,
    };
  }
}