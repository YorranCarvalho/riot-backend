// src/controllers/matchController.ts
import { Request, Response } from "express";
import { riotApi } from "../lib/riot";

type RiotParticipant = {
  puuid: string;
  summonerName: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  teamPosition: string;
  lane: string;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
};

export const getFullProfile = async (req: Request, res: Response) => {
  const { name, tag } = req.params;

  console.log("RIOT_API_KEY exists?", !!process.env.RIOT_API_KEY);
  console.log("RIOT_API_KEY preview:", process.env.RIOT_API_KEY?.slice(0, 10));

  try {
    const accountRes = await riotApi.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    );

    const { puuid, gameName, tagLine } = accountRes.data;

    const [summonerRes, masteryRes, matchIdsRes] = await Promise.all([
      riotApi.get(
        `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
      ),
      riotApi.get(
        `https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`
      ),
      riotApi.get(
        `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`
      ),
    ]);

    const matchIds: string[] = matchIdsRes.data;

    const matchDetails = await Promise.all(
      matchIds.map((matchId) =>
        riotApi.get(
          `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`
        )
      )
    );

    const recentMatches = matchDetails.map((matchRes) => {
      const match = matchRes.data;
      const participant: RiotParticipant | undefined = match.info.participants.find(
        (p: RiotParticipant) => p.puuid === puuid
      );

      if (!participant) return null;

      return {
        matchId: match.metadata.matchId,
        gameCreation: match.info.gameCreation,
        gameDuration: match.info.gameDuration,
        queueId: match.info.queueId,
        championName: participant.championName,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        kda: Number(
          ((participant.kills + participant.assists) / Math.max(1, participant.deaths)).toFixed(2)
        ),
        win: participant.win,
        role: participant.teamPosition || participant.lane || "UNKNOWN",
        farm:
          (participant.totalMinionsKilled || 0) +
          (participant.neutralMinionsKilled || 0),
        goldEarned: participant.goldEarned,
        damage: participant.totalDamageDealtToChampions,
        items: [
          participant.item0,
          participant.item1,
          participant.item2,
          participant.item3,
          participant.item4,
          participant.item5,
          participant.item6,
        ],
        summonerSpells: [participant.summoner1Id, participant.summoner2Id],
      };
    }).filter(Boolean);

    const wins = recentMatches.filter((m: any) => m.win).length;
    const losses = recentMatches.length - wins;

    const averageKda =
      recentMatches.length > 0
        ? Number(
            (
              recentMatches.reduce((acc: number, match: any) => acc + match.kda, 0) /
              recentMatches.length
            ).toFixed(2)
          )
        : 0;

    const roleCount = recentMatches.reduce((acc: Record<string, number>, match: any) => {
      acc[match.role] = (acc[match.role] || 0) + 1;
      return acc;
    }, {});

    const mostPlayedRole =
      Object.entries(roleCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "UNKNOWN";

    return res.json({
      basic: {
        puuid,
        name: gameName,
        tag: tagLine,
        profileIconId: summonerRes.data.profileIconId,
        level: summonerRes.data.summonerLevel,
      },
      mastery: masteryRes.data.slice(0, 5),
      stats: {
        wins,
        losses,
        averageKda,
        mostPlayedRole,
      },
      recentMatches,
    });
  } catch (error: any) {
      console.error("RIOT ERROR STATUS:", error.response?.status);
      console.error("RIOT ERROR DATA:", error.response?.data || error.message);

      const status = error.response?.status || 500;

      if (status === 404) {
        return res.status(404).json({
          error: "Invocador não encontrado",
        });
      }

      return res.status(status).json({
        error: "Erro ao montar perfil completo",
        details: error.response?.data || error.message,
      });
    }
};