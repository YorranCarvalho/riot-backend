// src/modules/tactician/services/tactician-profile.service.ts
import axios from "axios";
import { env } from "../../../config/env";
import { TacticianSummonerService } from "./tactician-summoner.service";
import { TacticianRankedService } from "./tactician-ranked.service";
import { TacticianMatchService } from "./tactician-match.service";
import { mapTftMatch } from "../mappers/riot-tft-profile.mapper";
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
      `https://${env.RIOT_REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
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

    const matchIds = await this.tacticianMatchService.getMatchIds(puuid, 10);
    const rawMatches = await Promise.all(
      matchIds.map((matchId: string) => this.tacticianMatchService.getMatch(matchId))
    );

    const recentMatches = rawMatches
    .map((match) => mapTftMatch(match, puuid))
    .filter(Boolean);

    const performance = buildTftPerformanceSummary(recentMatches as any[]);

    return {
      account: {
        puuid: account.puuid,
        gameName: account.gameName,
        tagLine: account.tagLine,
      },
      profile: {
        summonerId: profile?.id ?? null,
        accountId: profile?.accountId ?? null,
        profileIconId: profile?.profileIconId ?? null,
        summonerLevel: profile?.summonerLevel ?? null,
        region: env.RIOT_PLATFORM.toUpperCase(),
      },
      ranked: ranked
        ? {
            queueType: ranked.queueType,
            tier: ranked.tier,
            rank: ranked.rank,
            leaguePoints: ranked.leaguePoints,
            wins: ranked.wins,
            losses: ranked.losses,
          }
        : null,
      recentMatches,
      performance
    };
  }
}