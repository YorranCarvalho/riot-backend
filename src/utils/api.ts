import axios from 'axios';
import { env } from '../config/env';

export const riotApi = axios.create({
    headers: {
        'X-Riot-Token': env.RIOT_API_KEY,
    },
});