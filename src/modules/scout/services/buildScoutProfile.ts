import { ScoutProfileDto } from "../dto/scout-profile.dto";
import { MatchScoutStats } from "../types/scout.types";
import {
  aggregateMatches,
  buildChampionPool,
  buildScoutTrends,
  getPrimaryRole,
} from "./scoutAggregation";
import {
  calculateScoutScores,
  decorateMatchesWithPerformance,
} from "./scoutScore";

interface BuildScoutProfileParams {
  basic: ScoutProfileDto["basic"];
  ranked: ScoutProfileDto["ranked"];
  mastery: ScoutProfileDto["mastery"];
  stats: ScoutProfileDto["stats"];
  scores: ScoutProfileDto["scores"];
  recentMatches: MatchScoutStats[];
  traits: ScoutProfileDto["traits"];
}

export function buildScoutProfile({
  basic,
  ranked,
  mastery,
  stats,
  scores,
  recentMatches,
  traits,
}: BuildScoutProfileParams) {
  const decoratedMatches = decorateMatchesWithPerformance(recentMatches);
  const aggregatedStats = aggregateMatches(decoratedMatches);
  const primaryRole = getPrimaryRole(decoratedMatches);
  const championPool = buildChampionPool(decoratedMatches);
  const trends = buildScoutTrends(decoratedMatches);

  const { scores: scoutScores, overview } = calculateScoutScores({
    matches: decoratedMatches,
    aggregatedStats,
    championPool,
    primaryRole,
    trends,
  });

  const warnings: string[] = [];

  if (decoratedMatches.length < 10) {
    warnings.push("Small sample size");
  }

  if (!ranked?.soloDuo && !ranked?.flex) {
    warnings.push("Ranked data unavailable");
  }

  return {
    basic,
    ranked,
    mastery,
    stats,
    scores: {
      ...scores,
      scoutScore: scoutScores.scoutScore,
      recentForm: scoutScores.recentForm,
      mechanics: scoutScores.mechanics,
      championPool: scoutScores.championPool,
      roleConfidence: scoutScores.roleConfidence,
      riskControl: scoutScores.riskControl,
      advancedConsistencyScore: scoutScores.consistency,
    },
    championPool,
    recentMatches: decoratedMatches,
    traits,
    overview,
    averages: aggregatedStats,
    trends,
    warnings,
  };
}