export type ScoutTrait = {
  key: string;
  label: string;
  color: "red" | "green" | "yellow" | "blue" | "purple" | "pink";
  description: string;
};

export type RecentMatch = {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  queueId: number;
  championName: string;
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
};

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function mostFrequent(values: string[]) {
  if (!values.length) return null;

  const countMap: Record<string, number> = {};

  for (const value of values) {
    countMap[value] = (countMap[value] || 0) + 1;
  }

  return Object.entries(countMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export function buildScoutTraits(matches: RecentMatch[]): ScoutTrait[] {
  if (!matches.length) return [];

  const traits: ScoutTrait[] = [];

  const avgDamage = average(matches.map((match) => match.damage));
  const avgFarm = average(matches.map((match) => match.farm));
  const avgGold = average(matches.map((match) => match.goldEarned));
  const avgKda = average(matches.map((match) => match.kda));
  const avgDeaths = average(matches.map((match) => match.deaths));
  const avgKills = average(matches.map((match) => match.kills));
  const avgAssists = average(matches.map((match) => match.assists));
  const winRate =
    (matches.filter((match) => match.win).length / matches.length) * 100;

  const roles = matches.map((match) => match.role).filter(Boolean);
  const mainRole = mostFrequent(roles);

  const uniqueChampions = new Set(matches.map((match) => match.championName)).size;

  const highDamageGames = matches.filter((match) => match.damage >= 25000).length;
  const highFarmGames = matches.filter((match) => match.farm >= 180).length;
  const highAssistGames = matches.filter((match) => match.assists >= 10).length;
  const lowDeathGames = matches.filter((match) => match.deaths <= 3).length;
  const carryGames = matches.filter(
    (match) => match.kills >= 8 && match.damage >= 22000
  ).length;

  if (avgDamage >= 22000 || highDamageGames >= 4) {
    traits.push({
      key: "damage_dealer",
      label: "Damage Dealer",
      color: "red",
      description: "Causa dano alto com frequência nas partidas recentes.",
    });
  }

  if (avgFarm >= 170 || highFarmGames >= 4) {
    traits.push({
      key: "early_farmer",
      label: "Early Farmer",
      color: "green",
      description: "Mantém uma média de farm forte nas partidas recentes.",
    });
  }

  if (avgAssists >= 9 || highAssistGames >= 4) {
    traits.push({
      key: "catalyst",
      label: "Catalyst",
      color: "green",
      description: "Tem boa participação em jogadas e contribui bastante com assistências.",
    });
  }

  if (avgKda >= 3.5 && avgDeaths <= 4) {
    traits.push({
      key: "safe_performer",
      label: "Safe Performer",
      color: "blue",
      description: "Entrega boas partidas com consistência e poucas mortes.",
    });
  }

  if (lowDeathGames >= 5) {
    traits.push({
      key: "hard_to_catch",
      label: "Hard to Catch",
      color: "blue",
      description: "Morre pouco e costuma se manter vivo por mais tempo nas lutas.",
    });
  }

  if (avgKills >= 7 || carryGames >= 3) {
    traits.push({
      key: "solo_fighter",
      label: "Solo Fighter",
      color: "yellow",
      description: "Tem presença ofensiva forte e costuma decidir lutas com impacto individual.",
    });
  }

  if (avgGold >= 13000) {
    traits.push({
      key: "gold_hungry",
      label: "Gold Hungry",
      color: "yellow",
      description: "Consegue acumular bastante ouro ao longo das partidas.",
    });
  }

  if (mainRole === "MIDDLE" || mainRole === "MID") {
    traits.push({
      key: "mid_game_master",
      label: "Mid Game Master",
      color: "green",
      description: "Joga com frequência no meio e mostra conforto nessa rota.",
    });
  }

  if (mainRole === "TOP") {
    traits.push({
      key: "lane_tyrant",
      label: "Lane Tyrant",
      color: "pink",
      description: "Tem presença marcante na lane e costuma pressionar duelos e vantagem lateral.",
    });
  }

  if (mainRole === "JUNGLE") {
    traits.push({
      key: "path_maker",
      label: "Path Maker",
      color: "purple",
      description: "Atua bastante pela selva e influencia o mapa com presença em várias áreas.",
    });
  }

  if (mainRole === "UTILITY" || mainRole === "SUPPORT") {
    traits.push({
      key: "team_enabler",
      label: "Team Enabler",
      color: "purple",
      description: "Tem foco maior em suporte, utilidade e ajuda ao time.",
    });
  }

  if (mainRole === "BOTTOM" || mainRole === "ADC") {
    traits.push({
      key: "late_game_threat",
      label: "Late Game Threat",
      color: "pink",
      description: "Escala bem nas partidas e costuma ser ameaça constante no decorrer do jogo.",
    });
  }

  if (winRate >= 60 && matches.length >= 5) {
    traits.push({
      key: "hot_streak",
      label: "Hot Streak",
      color: "red",
      description: "Está em boa fase e vem acumulando resultados fortes recentemente.",
    });
  }

  if (uniqueChampions <= 3 && matches.length >= 6) {
    traits.push({
      key: "specialist",
      label: "Specialist",
      color: "purple",
      description: "Concentra a maior parte das partidas em poucos campeões.",
    });
  }

  if (uniqueChampions >= 6 && matches.length >= 8) {
    traits.push({
      key: "versatile",
      label: "Versatile",
      color: "pink",
      description: "Mostra variedade de picks e consegue atuar com campeões diferentes.",
    });
  }

  return traits.slice(0, 8);
}