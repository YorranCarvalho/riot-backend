import {
  AggregatedScoutStats,
  ChampionPoolEntry,
  MatchScoutStats,
  ScoutOverview,
  ScoutScores,
  ScoutTrends,
} from "../types/scout.types";
import {
  average,
  clamp,
  idealRangeScore,
  inverseNormalize,
  normalize,
  stdDev,
  weightedAverage,
} from "../utils/scoutMatch";

function calculateMatchPerformanceScore(match: MatchScoutStats) {
  const kdaScore = normalize(match.kda, 1.5, 6);
  const dpmScore = normalize(match.damagePerMin, 300, 1000);
  const csmScore = normalize(match.csPerMin, 3, 9);
  const gpmScore = normalize(match.goldPerMin, 250, 500);
  const deathsScore = inverseNormalize(match.deaths, 10, 2);
  const winBonus = match.win ? 8 : 0;

  return clamp(
    weightedAverage([
      [kdaScore, 0.25],
      [dpmScore, 0.25],
      [csmScore, 0.15],
      [gpmScore, 0.15],
      [deathsScore, 0.20],
    ]) + winBonus
  );
}

function getMatchPerformanceLabel(
  score: number
): "Great" | "Good" | "Average" | "Poor" {
  if (score >= 80) return "Great";
  if (score >= 65) return "Good";
  if (score >= 45) return "Average";
  return "Poor";
}

function classifyGame(match: MatchScoutStats) {
  const goodGame =
    match.kda >= 3 &&
    match.deaths <= 5 &&
    match.damagePerMin >= 550;

  const badGame =
    match.kda < 1.5 &&
    match.deaths >= 8 &&
    match.damagePerMin < 450;

  return {
    goodGame,
    badGame,
    highDeathGame: match.deaths >= 8,
  };
}

function calculateRecentFormScore(matches: MatchScoutStats[]) {
  const recent = matches.slice(0, 20);
  const last10 = matches.slice(0, 10);

  const winrateScore = normalize(
    recent.length ? (recent.filter((match) => match.win).length / recent.length) * 100 : 0,
    40,
    70
  );

  const kdaScore = normalize(average(recent.map((match) => match.kda)), 2, 6);
  const dpmScore = normalize(average(recent.map((match) => match.damagePerMin)), 400, 1000);
  const gpmScore = normalize(average(recent.map((match) => match.goldPerMin)), 300, 500);
  const csmScore = normalize(average(recent.map((match) => match.csPerMin)), 4, 9);
  const deathsScore = inverseNormalize(average(recent.map((match) => match.deaths)), 8, 2);

  const goodRate =
    last10.length
      ? (last10.filter((match) => classifyGame(match).goodGame).length / last10.length) * 100
      : 0;

  const trendScore = normalize(goodRate, 30, 80);

  return weightedAverage([
    [winrateScore, 0.25],
    [kdaScore, 0.15],
    [dpmScore, 0.20],
    [gpmScore, 0.15],
    [csmScore, 0.10],
    [deathsScore, 0.10],
    [trendScore, 0.05],
  ]);
}

function calculateMechanicsScore(stats: AggregatedScoutStats) {
  const dpm = normalize(stats.damagePerMin, 400, 1000);
  const csm = normalize(stats.csPerMin, 4, 9);
  const gpm = normalize(stats.goldPerMin, 300, 500);
  const kp = normalize(stats.killParticipation, 35, 75);
  const kda = normalize(stats.kda, 2, 6);
  const vision = normalize(stats.visionPerMin, 0.3, 2.0);

  return weightedAverage([
    [dpm, 0.25],
    [csm, 0.20],
    [gpm, 0.20],
    [kp, 0.15],
    [kda, 0.10],
    [vision, 0.10],
  ]);
}

function calculateConsistencyScore(matches: MatchScoutStats[]) {
  const sample = matches.slice(0, 20);

  const goodGamesRate =
    sample.length
      ? (sample.filter((match) => classifyGame(match).goodGame).length / sample.length) * 100
      : 0;

  const badGamesRate =
    sample.length
      ? (sample.filter((match) => classifyGame(match).badGame).length / sample.length) * 100
      : 0;

  const highDeathGamesRate =
    sample.length
      ? (sample.filter((match) => classifyGame(match).highDeathGame).length / sample.length) * 100
      : 0;

  const kdaStdDev = stdDev(sample.map((match) => match.kda));
  const dpmStdDev = stdDev(sample.map((match) => match.damagePerMin));

  const goodRateScore = normalize(goodGamesRate, 20, 80);
  const badRateScore = inverseNormalize(badGamesRate, 40, 5);
  const kdaVarianceScore = inverseNormalize(kdaStdDev, 3, 0.8);
  const dpmVarianceScore = inverseNormalize(dpmStdDev, 350, 100);
  const intRateScore = inverseNormalize(highDeathGamesRate, 35, 5);

  return weightedAverage([
    [goodRateScore, 0.30],
    [badRateScore, 0.25],
    [kdaVarianceScore, 0.20],
    [dpmVarianceScore, 0.15],
    [intRateScore, 0.10],
  ]);
}

function calculateChampionPoolScore(
  championPool: ChampionPoolEntry[],
  matches: MatchScoutStats[]
) {
  const top3 = championPool.slice(0, 3);
  const uniqueChampions = championPool.length;
  const totalGames = matches.length || 1;
  const topChampionGames = championPool[0]?.games || 0;
  const oneTrickDependency = (topChampionGames / totalGames) * 100;

  const top3AverageWinrate = top3.length
    ? average(top3.map((champion) => champion.winRate))
    : 0;

  const top3TotalGames = top3.reduce((acc, champion) => acc + champion.games, 0);

  const top3WinrateScore = normalize(top3AverageWinrate, 45, 65);
  const top3VolumeScore = normalize(top3TotalGames, 10, 40);
  const diversityScore = idealRangeScore(uniqueChampions, 3, 6, 10);
  const dependencyScore = inverseNormalize(oneTrickDependency, 80, 30);

  return weightedAverage([
    [top3WinrateScore, 0.35],
    [top3VolumeScore, 0.25],
    [diversityScore, 0.25],
    [dependencyScore, 0.15],
  ]);
}

function calculateRoleConfidenceScore(matches: MatchScoutStats[], primaryRole: string) {
  const totalGames = matches.length || 1;
  const mainRoleMatches = matches.filter((match) => match.role === primaryRole);
  const offRoleMatches = matches.filter((match) => match.role !== primaryRole);

  const mainRolePickRate = (mainRoleMatches.length / totalGames) * 100;
  const mainRoleWinRate = mainRoleMatches.length
    ? (mainRoleMatches.filter((match) => match.win).length / mainRoleMatches.length) * 100
    : 0;

  const mainRoleScore = average(
    mainRoleMatches.map((match) => calculateMatchPerformanceScore(match))
  );

  const offRoleScore = average(
    offRoleMatches.map((match) => calculateMatchPerformanceScore(match))
  );

  const offRoleDropoff = Math.max(0, mainRoleScore - offRoleScore);

  const roleFrequency = normalize(mainRolePickRate, 40, 85);
  const roleWinrate = normalize(mainRoleWinRate, 45, 65);
  const rolePerformance = normalize(mainRoleScore, 45, 85);
  const offRolePenalty = inverseNormalize(offRoleDropoff, 30, 5);

  return weightedAverage([
    [roleFrequency, 0.30],
    [roleWinrate, 0.30],
    [rolePerformance, 0.25],
    [offRolePenalty, 0.15],
  ]);
}

function calculateRiskControlScore(
  matches: MatchScoutStats[],
  championPool: ChampionPoolEntry[],
  trends: ScoutTrends
) {
  const sample = matches.slice(0, 20);
  const totalGames = matches.length || 1;
  const topChampionGames = championPool[0]?.games || 0;
  const championDependency = (topChampionGames / totalGames) * 100;

  const highDeathRate =
    sample.length
      ? (sample.filter((match) => match.deaths >= 8).length / sample.length) * 100
      : 0;

  const recentDropoff = Math.max(0, trends.last20WinRate - trends.last10WinRate);
  const sampleReliability = normalize(totalGames, 10, 40);

  const deathsControl = inverseNormalize(highDeathRate, 40, 5);
  const declineControl = inverseNormalize(recentDropoff, 30, 0);
  const dependencyControl = inverseNormalize(championDependency, 85, 30);

  return weightedAverage([
    [deathsControl, 0.35],
    [declineControl, 0.25],
    [dependencyControl, 0.20],
    [sampleReliability, 0.20],
  ]);
}

function getScoutTier(score: number): ScoutOverview["scoutTier"] {
  if (score >= 85) return "Elite";
  if (score >= 75) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Average";
  return "Risky";
}

function getScoutVerdict(score: number) {
  if (score >= 85) return "Priority scout";
  if (score >= 75) return "Strong pickup";
  if (score >= 65) return "Worth considering";
  if (score >= 50) return "Situational";
  return "Avoid for now";
}

function getPlaystyleTags(
  stats: AggregatedScoutStats,
  matches: MatchScoutStats[],
  championPool: ChampionPoolEntry[],
  consistencyScore: number,
  primaryRoleRate: number
) {
  const tags: string[] = [];
  const totalGames = matches.length || 1;
  const topChampionGames = championPool[0]?.games || 0;
  const oneTrickDependency = (topChampionGames / totalGames) * 100;

  if (consistencyScore >= 75) tags.push("Consistent");
  if (stats.damagePerMin >= 800) tags.push("High Damage");
  if (stats.deaths <= 3.5) tags.push("Low Death");
  if (stats.killParticipation >= 65) tags.push("Teamfighter");
  if (oneTrickDependency >= 70) tags.push("One Trick");
  if (championPool.length >= 5 && average(championPool.slice(0, 3).map((champ) => champ.winRate)) >= 52) {
    tags.push("Flexible");
  }

  const recent10 = matches.slice(0, 10);
  const recentWinrate = recent10.length
    ? (recent10.filter((match) => match.win).length / recent10.length) * 100
    : 0;

  if (recentWinrate >= 65) tags.push("Hot Streak");
  if (recentWinrate <= 40) tags.push("Cold Streak");
  if (primaryRoleRate >= 70) tags.push("Specialist");

  return tags.slice(0, 4);
}

function getStrengths(scores: Omit<ScoutScores, "scoutScore">) {
  const mapping = [
    { key: "recentForm", label: "Excellent recent form" },
    { key: "mechanics", label: "Strong mechanical output" },
    { key: "consistency", label: "Very consistent performances" },
    { key: "championPool", label: "Reliable champion pool" },
    { key: "roleConfidence", label: "High confidence on main role" },
    { key: "riskControl", label: "Low-risk profile" },
  ] as const;

  return mapping
    .filter((item) => scores[item.key] >= 75)
    .sort((a, b) => scores[b.key] - scores[a.key])
    .slice(0, 3)
    .map((item) => item.label);
}

function getWeaknesses(
  scores: Omit<ScoutScores, "scoutScore">,
  stats: AggregatedScoutStats,
  matches: MatchScoutStats[],
  championPool: ChampionPoolEntry[],
  primaryRoleRate: number
) {
  const weaknesses: string[] = [];
  const totalGames = matches.length || 1;
  const topChampionGames = championPool[0]?.games || 0;
  const oneTrickDependency = (topChampionGames / totalGames) * 100;
  const recent10 = matches.slice(0, 10);
  const recentWinrate = recent10.length
    ? (recent10.filter((match) => match.win).length / recent10.length) * 100
    : 0;

  if (scores.consistency < 50) weaknesses.push("Unstable performances");
  if (stats.deaths > 6) weaknesses.push("Too many deaths");
  if (scores.championPool < 50) weaknesses.push("Limited champion pool");
  if (recentWinrate < 45) weaknesses.push("Poor recent form");
  if (stats.visionPerMin < 0.6) weaknesses.push("Low map impact");
  if (primaryRoleRate < 50) weaknesses.push("Low role specialization");
  if (oneTrickDependency > 75) weaknesses.push("High champion dependency");

  return weaknesses.slice(0, 3);
}

export function decorateMatchesWithPerformance(matches: MatchScoutStats[]) {
  return matches.map((match) => {
    const performanceScore = calculateMatchPerformanceScore(match);
    const performanceLabel = getMatchPerformanceLabel(performanceScore);

    return {
      ...match,
      performanceScore,
      performanceLabel,
    };
  });
}

export function calculateScoutScores(params: {
  matches: MatchScoutStats[];
  aggregatedStats: AggregatedScoutStats;
  championPool: ChampionPoolEntry[];
  primaryRole: string;
  trends: ScoutTrends;
}) {
  const { matches, aggregatedStats, championPool, primaryRole, trends } = params;

  const totalGames = matches.length || 1;
  const mainRoleMatches = matches.filter((match) => match.role === primaryRole);
  const primaryRoleRate = (mainRoleMatches.length / totalGames) * 100;

  const recentForm = calculateRecentFormScore(matches);
  const mechanics = calculateMechanicsScore(aggregatedStats);
  const consistency = calculateConsistencyScore(matches);
  const championPoolScore = calculateChampionPoolScore(championPool, matches);
  const roleConfidence = calculateRoleConfidenceScore(matches, primaryRole);
  const riskControl = calculateRiskControlScore(matches, championPool, trends);

  const scoutScore = weightedAverage([
    [recentForm, 0.25],
    [mechanics, 0.25],
    [consistency, 0.20],
    [championPoolScore, 0.15],
    [roleConfidence, 0.10],
    [riskControl, 0.05],
  ]);

  const rawScores = {
    recentForm: Math.round(recentForm),
    mechanics: Math.round(mechanics),
    consistency: Math.round(consistency),
    championPool: Math.round(championPoolScore),
    roleConfidence: Math.round(roleConfidence),
    riskControl: Math.round(riskControl),
  };

  const overview: ScoutOverview = {
    scoutScore: Math.round(scoutScore),
    scoutTier: getScoutTier(scoutScore),
    verdict: getScoutVerdict(scoutScore),
    primaryRole,
    sampleSize: matches.length,
    tags: getPlaystyleTags(
      aggregatedStats,
      matches,
      championPool,
      consistency,
      primaryRoleRate
    ),
    strengths: getStrengths(rawScores),
    weaknesses: getWeaknesses(
      rawScores,
      aggregatedStats,
      matches,
      championPool,
      primaryRoleRate
    ),
  };

  const scores: ScoutScores = {
    ...rawScores,
    scoutScore: Math.round(scoutScore),
  };

  return {
    scores,
    overview,
  };
}