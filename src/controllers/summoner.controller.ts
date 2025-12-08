import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma";

export const getSummonerByRiotId = async (req: Request, res: Response) => {
  const { name, tag } = req.params;
  const apiKey = process.env.RIOT_API_KEY;

  try {
    // 1) Buscar PUUID
    const accountResponse = await axios.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
      {
        headers: {
          "X-Riot-Token": apiKey
        }
      }
    );

    const { puuid, gameName, tagLine } = accountResponse.data;

    // 2) Buscar Summoner Info
    const summonerResponse = await axios.get(
      `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          "X-Riot-Token": apiKey
        }
      }
    );

    const summoner = summonerResponse.data;

    // 3) Salvar / atualizar
    const saved = await prisma.summoner.upsert({
      where: { puuid },
      update: {
        name: gameName,
        tag: tagLine,
        profileIconId: summoner.profileIconId,
        level: summoner.summonerLevel
      },
      create: {
        puuid,
        name: gameName,
        tag: tagLine,
        profileIconId: summoner.profileIconId,
        level: summoner.summonerLevel
      }
    });

    return res.json(saved);
  } catch (error: any) {
    console.error(error.response?.data || error);

    return res.status(500).json({
      error: "Erro ao buscar Summoner",
      details: error.response?.data || error
    });
  }
};
