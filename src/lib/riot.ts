import axios from "axios";

export const riotApi = axios.create({
  timeout: 10000,
  headers: {
    "X-Riot-Token": process.env.RIOT_API_KEY || "",
  },
});