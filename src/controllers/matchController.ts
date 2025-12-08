import { Request, Response } from "express";
import axios from "axios";

export const getMatchesByPuuid = async (req: Request, res: Response) => {
  const { puuid } = req.params;
  const apiKey = process.env.RIOT_API_KEY;

  try {
    const response = await axios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=20&api_key=${apiKey}`
    );

    return res.json(response.data);
  } catch (error: any) {
    console.error(error.response?.data || error);
    return res.status(500).json({ error: "Erro ao buscar histórico" });
  }
};

export const getMatchDetails = async (req: Request, res: Response) => {
  const { matchId } = req.params;
  const apiKey = process.env.RIOT_API_KEY;

  try {
    const response = await axios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`
    );

    return res.json(response.data);
  } catch (error: any) {
    console.error(error.response?.data || error);
    return res.status(500).json({ error: "Erro ao buscar detalhes da partida" });
  }
};

export const getChampionMastery = async (req: Request, res: Response) => {
  const { puuid } = req.params;
  const apiKey = process.env.RIOT_API_KEY;

  try {
    const response = await axios.get(
      `https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}?api_key=${apiKey}`
    );

    return res.json(response.data);
  } catch (error: any) {
    console.error(error.response?.data || error);
    return res.status(500).json({ error: "Erro ao buscar champion mastery" });
  }
};

export const getMostPlayedRole = async (req: Request, res: Response) => {
  const { puuid } = req.params;
  const apiKey = process.env.RIOT_API_KEY;

  try {
    const matchIdsRes = await axios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=30&api_key=${apiKey}`
    );

    const matchIds = matchIdsRes.data;

    const rolesCount: Record<string, number> = {};

    for (const matchId of matchIds) {
      const matchRes = await axios.get(
        `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`
      );

      const info = matchRes.data.info.participants.find((p: any) => p.puuid === puuid);

      if (!info) continue;

      const role = info.teamPosition || info.lane;

      rolesCount[role] = (rolesCount[role] || 0) + 1;
    }

    return res.json({
      roles: rolesCount,
      mostPlayed: Object.entries(rolesCount).sort((a, b) => b[1] - a[1])[0]
    });
  } catch (error: any) {
    console.error(error.response?.data || error);
    return res.status(500).json({ error: "Erro ao buscar role mais jogada" });
  }
};

export const getFullProfile = async (req: Request, res: Response) => {
  const { name, tag } = req.params;
  const apiKey = process.env.RIOT_API_KEY;

  try {
    // 1 — Buscar dados básicos
    const account = await axios.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}?api_key=${apiKey}`
    );

    const { puuid, gameName, tagLine } = account.data;

    const summoner = await axios.get(
      `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`
    );

    // 2 — Mastery (champions)
    const mastery = await axios.get(
      `https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}?api_key=${apiKey}`
    );

    // 3 — Histórico
    const matchesIds = await axios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=20&api_key=${apiKey}`
    );

    return res.json({
      basic: summoner.data,
      mastery: mastery.data.slice(0, 5), // top 5 campeões
      matches: matchesIds.data
    });
  } catch (error: any) {
    console.error(error.response?.data || error);
    return res.status(500).json({ error: "Erro ao montar perfil completo" });
  }
};
