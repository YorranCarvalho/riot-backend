import {riotApi} from '../utils/api';

export class RiotService {
    static async getSummonerByName(name: string) {
        const res = await riotApi.get(
            `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(name)}`
        );
        return res.data
    }
}