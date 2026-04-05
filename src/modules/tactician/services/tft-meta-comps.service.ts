import { TftDetectedCompDto } from "../dto/tft-meta-comp.dto";
import { TftMatchSnapshot } from "../types/tft-match-snapshot.type";
import {
  buildCompId,
  calculateAugmentFrequency,
  calculateAverageLevel,
  calculateAveragePlacement,
  calculateCompScore,
  calculateTop4Rate,
  calculateTraitFrequency,
  calculateUnitFrequency,
  calculateWinRate,
  clusterSnapshots,
  getTierFromScore,
  inferCompName,
} from "../utils/tft-comp.utils";
import { mapRiotMatchToSnapshots } from "../utils/tft-riot-snapshot.mapper";
import { TacticianMatchService } from "./tactician-match.service";

type ExecuteInput = {
  snapshots: TftMatchSnapshot[];
  patch?: string;
  minGames?: number;
  similarityThreshold?: number;
  topPlacementOnly?: boolean;
};

type ExecuteFromMatchesInput = {
  puuid: string;
  start?: number;
  count?: number;
  patch?: string;
  minGames?: number;
  similarityThreshold?: number;
  topPlacementOnly?: boolean;
};

export class TftMetaCompsService {
  private tacticianMatchService = new TacticianMatchService();

  execute({
    snapshots,
    patch,
    minGames = 8,
    similarityThreshold = 0.75,
    topPlacementOnly = true,
  }: ExecuteInput): TftDetectedCompDto[] {
    let filteredSnapshots = [...snapshots];

    if (patch) {
      filteredSnapshots = filteredSnapshots.filter(
        (snapshot) => snapshot.patch === patch
      );
    }

    if (topPlacementOnly) {
      filteredSnapshots = filteredSnapshots.filter(
        (snapshot) => snapshot.placement <= 4
      );
    }

    const clusters = clusterSnapshots(filteredSnapshots, similarityThreshold);

    const detectedComps = clusters
      .filter((cluster) => cluster.length >= minGames)
      .map((cluster, index) => {
        const games = cluster.length;
        const averagePlacement = calculateAveragePlacement(cluster);
        const top4Rate = calculateTop4Rate(cluster);
        const winRate = calculateWinRate(cluster);
        const averageLevel = calculateAverageLevel(cluster);

        const unitFrequency = calculateUnitFrequency(cluster);
        const traitFrequency = calculateTraitFrequency(cluster);
        const augmentFrequency = calculateAugmentFrequency(cluster);

        const coreUnits = unitFrequency
          .filter((unit) => unit.frequency >= 0.8)
          .map((unit) => ({
            characterId: unit.characterId,
            name: unit.name,
            frequency: unit.frequency,
          }));

        const flexUnits = unitFrequency
          .filter((unit) => unit.frequency >= 0.35 && unit.frequency < 0.8)
          .map((unit) => ({
            characterId: unit.characterId,
            name: unit.name,
            frequency: unit.frequency,
          }));

        const traits = traitFrequency
          .filter((trait) => trait.frequency >= 0.3)
          .map((trait) => ({
            name: trait.name,
            averageTier: trait.averageTier,
            frequency: trait.frequency,
          }));

        const augments = augmentFrequency.slice(0, 5).map((augment) => ({
          name: augment.name,
          frequency: augment.frequency,
        }));

        const name = inferCompName(cluster);
        const score = calculateCompScore({
          top4Rate,
          winRate,
          averagePlacement,
        });

        const clusterPatch = cluster[0]?.patch ?? patch ?? "unknown";

        return {
          id: buildCompId(name, clusterPatch, index + 1),
          name,
          tier: getTierFromScore(score),
          patch: clusterPatch,
          games,
          averagePlacement: Number(averagePlacement.toFixed(2)),
          top4Rate: Number((top4Rate * 100).toFixed(2)),
          winRate: Number((winRate * 100).toFixed(2)),
          averageLevel: Number(averageLevel.toFixed(2)),
          coreUnits,
          flexUnits,
          traits,
          augments,
          sampleMatchIds: cluster
            .slice(0, 5)
            .map((snapshot) => snapshot.matchId),
        };
      })
      .sort((a, b) => {
        if (a.tier !== b.tier) {
          const tierOrder = { S: 4, A: 3, B: 2, C: 1 };
          return tierOrder[b.tier] - tierOrder[a.tier];
        }

        if (b.top4Rate !== a.top4Rate) {
          return b.top4Rate - a.top4Rate;
        }

        return b.games - a.games;
      });

    return detectedComps;
  }

  async executeFromMatches({
    puuid,
    start = 0,
    count = 20,
    patch,
    minGames = 8,
    similarityThreshold = 0.75,
    topPlacementOnly = true,
  }: ExecuteFromMatchesInput): Promise<TftDetectedCompDto[]> {
    const matches = await this.tacticianMatchService.getMatchesByPuuid({
      puuid,
      start,
      count,
    });

    const snapshots = matches.flatMap((match) =>
      mapRiotMatchToSnapshots(match)
    );

    return this.execute({
      snapshots,
      patch,
      minGames,
      similarityThreshold,
      topPlacementOnly,
    });
  }
}