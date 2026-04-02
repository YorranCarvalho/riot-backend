// src/controllers/matchController.ts
import { Request, Response } from "express";
import { riotApi } from "../lib/riot";
import { buildScoutTraits, RecentMatch } from "../utils/buildScoutTraits";

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

type RiotSummonerResponse = {
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
  id?: string;
  accountId?: string;
};

type RiotLeagueEntry = {
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

type RankedSeason = {
  season: string;
  tier: string;
  lp: number;
};

type RankedQueue = {
  currentTier: string;
  currentLp: number;
  seasons: RankedSeason[];
};

type RankedResponse = {
  soloDuo: RankedQueue;
  flex: RankedQueue;
};

type RiotMatchParticipant = {
  puuid: string;
  summonerName: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  championName: string;
  teamId: number;
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
  champLevel: number;
};

type MatchDetailsParticipant = {
  puuid: string;
  summonerName: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  championName: string;
  teamId: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  win: boolean;
  role: string;
  farm: number;
  goldEarned: number;
  damage: number;
  items: number[];
  summonerSpells: number[];
  champLevel: number;
};

type MatchDetailsTeam = {
  teamId: number;
  win: boolean;
  participants: MatchDetailsParticipant[];
};

function formatRankedQueue(
  entry: RiotLeagueEntry | null,
  currentSeason: string
): RankedQueue {
  if (!entry) {
    return {
      currentTier: "RANK_UNAVAILABLE",
      currentLp: 0,
      seasons: [
        {
          season: currentSeason,
          tier: "RANK_UNAVAILABLE",
          lp: 0,
        },
      ],
    };
  }

  return {
    currentTier: `${entry.tier} ${entry.rank}`,
    currentLp: entry.leaguePoints,
    seasons: [
      {
        season: currentSeason,
        tier: `${entry.tier} ${entry.rank}`,
        lp: entry.leaguePoints,
      },
    ],
  };
}

function mapDetailedParticipant(
  participant: RiotMatchParticipant
): MatchDetailsParticipant {
  return {
    puuid: participant.puuid,
    summonerName: participant.summonerName,
    riotIdGameName: participant.riotIdGameName,
    riotIdTagline: participant.riotIdTagline,
    championName: participant.championName,
    teamId: participant.teamId,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    kda: Number(
      (
        (participant.kills + participant.assists) /
        Math.max(1, participant.deaths)
      ).toFixed(2)
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
    champLevel: participant.champLevel,
  };
}

export const getFullProfile = async (req: Request, res: Response) => {
  const { name, tag } = req.params;
  
  console.log("RIOT_API_KEY exists?", !!process.env.RIOT_API_KEY);
  console.log("RIOT_API_KEY preview:", process.env.RIOT_API_KEY?.slice(0, 10));

  try {
    const accountRes = await riotApi.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    );
    console.log("account ok");

    const { puuid, gameName, tagLine } = accountRes.data;

    const summonerRes = await riotApi.get<RiotSummonerResponse>(
      `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
    );

    console.log("summoner ok");
    console.log("summoner data:", summonerRes.data);

    const [masteryRes, matchIdsRes] = await Promise.all([
      riotApi.get(
        `https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`
      ),
      riotApi.get(
        `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`
      ),
    ]);

    console.log("mastery ok");
    console.log("match ids ok");

    const summonerId = summonerRes.data?.id;
    let leagueEntries: RiotLeagueEntry[] = [];

    if (summonerId) {
      try {
        const rankedRes = await riotApi.get(
          `https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`
        );
        leagueEntries = rankedRes.data || [];
        console.log("ranked ok");
      } catch (rankedError: any) {
        console.error("ranked fetch failed:", rankedError.response?.data || rankedError.message);
      }
    } else {
      console.warn("summonerRes.data.id não veio na resposta da Riot. Ranked será tratado como UNRANKED.");
    }

    if (!summonerId) {
      console.warn(
        "summonerRes.data.id não veio na resposta da Riot. Ranked será tratado como indisponível."
      );
    }

    console.log("mastery ok");
    console.log("match ids ok");
    console.log("ranked ok");

    const matchIds: string[] = matchIdsRes.data;

    const matchDetails = await Promise.all(
      matchIds.map((matchId) =>
        riotApi.get(
          `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`
        )
      )
    );

    const currentSeason = "S2025";

    const soloDuoEntry =
      leagueEntries.find((entry) => entry.queueType === "RANKED_SOLO_5x5") || null;

    const flexEntry =
      leagueEntries.find((entry) => entry.queueType === "RANKED_FLEX_SR") || null;

    const ranked: RankedResponse = {
      soloDuo: formatRankedQueue(soloDuoEntry, currentSeason),
      flex: formatRankedQueue(flexEntry, currentSeason),
    };

    const recentMatches: RecentMatch[] = matchDetails
      .map((matchRes): RecentMatch | null => {
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
            (
              (participant.kills + participant.assists) /
              Math.max(1, participant.deaths)
            ).toFixed(2)
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
      })
      .filter((match): match is RecentMatch => match !== null);

    const traits = buildScoutTraits(recentMatches);
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

    console.log("summoner data:", summonerRes.data);

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
      traits,
      ranked
    });
  } catch (error: any) {
    console.error("FAILED URL:", error.config?.url);
    console.error("FAILED STATUS:", error.response?.status);
    console.error("FAILED DATA:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      error: "Erro ao montar perfil completo",
      details: error.response?.data || error.message,
      failedUrl: error.config?.url,
    });
  }
};

export const getMatchDetailsByMatchId = async (req: Request, res: Response) => {
  const { matchId, puuid } = req.params;

  try {
    const matchRes = await riotApi.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`
    );

    const match = matchRes.data;

    const participants: RiotMatchParticipant[] = match.info.participants || [];

    const mappedParticipants = participants.map(mapDetailedParticipant);

    const player = mappedParticipants.find((participant) => participant.puuid === puuid);

    if (!player) {
      return res.status(404).json({
        error: "Jogador não encontrado nesta partida.",
      });
    }

    const blueParticipants = mappedParticipants.filter(
      (participant) => participant.teamId === 100
    );

    const redParticipants = mappedParticipants.filter(
      (participant) => participant.teamId === 200
    );

    const blueTeam: MatchDetailsTeam = {
      teamId: 100,
      win: blueParticipants.some((participant) => participant.win),
      participants: blueParticipants,
    };

    const redTeam: MatchDetailsTeam = {
      teamId: 200,
      win: redParticipants.some((participant) => participant.win),
      participants: redParticipants,
    };

    return res.json({
      matchId: match.metadata.matchId,
      queueId: match.info.queueId,
      gameCreation: match.info.gameCreation,
      gameDuration: match.info.gameDuration,
      player,
      blueTeam,
      redTeam,
    });
  } catch (error: any) {
    console.error("FAILED URL:", error.config?.url);
    console.error("FAILED STATUS:", error.response?.status);
    console.error("FAILED DATA:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      error: "Erro ao buscar detalhes da partida",
      details: error.response?.data || error.message,
      failedUrl: error.config?.url,
    });
  }
};