import { riotApi } from "../../../lib/riot";
import { RiotAccountResponse } from "../types/riot.types";

export class RiotAccountService {
  async getByRiotId(name: string, tag: string): Promise<RiotAccountResponse> {
    const response = await riotApi.get<RiotAccountResponse>(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    );

    return response.data;
  }
}