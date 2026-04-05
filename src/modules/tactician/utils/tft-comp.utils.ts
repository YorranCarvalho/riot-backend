import { TftMatchSnapshot, TftTraitSnapshot, TftUnitSnapshot } from "../types/tft-match-snapshot.type";

type UnitFrequencyEntry = {
  characterId: string;
  name: string;
  count: number;
  frequency: number;
};

type TraitFrequencyEntry = {
  name: string;
  count: number;
  frequency: number;
  averageTier: number;
};

type AugmentFrequencyEntry = {
  name: string;
  count: number;
  frequency: number;
};

export function normalizeUnitIds(units: TftUnitSnapshot[]): string[] {
  return [...new Set(units.map((unit) => unit.characterId).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getActiveTraits(traits: TftTraitSnapshot[]): TftTraitSnapshot[] {
  return traits.filter((trait) => trait.tierCurrent > 0);
}

export function calculateUnitSimilarity(unitsA: string[], unitsB: string[]): number {
  const setA = new Set(unitsA);
  const setB = new Set(unitsB);

  const intersection = [...setA].filter((unit) => setB.has(unit)).length;
  const denominator = Math.max(setA.size, setB.size);

  if (denominator === 0) return 0;

  return intersection / denominator;
}

export function clusterSnapshots(
  snapshots: TftMatchSnapshot[],
  similarityThreshold = 0.75
): TftMatchSnapshot[][] {
  const clusters: TftMatchSnapshot[][] = [];

  for (const snapshot of snapshots) {
    const snapshotUnits = normalizeUnitIds(snapshot.units);
    let addedToCluster = false;

    for (const cluster of clusters) {
      const representative = cluster[0];
      const representativeUnits = normalizeUnitIds(representative.units);

      const similarity = calculateUnitSimilarity(snapshotUnits, representativeUnits);

      if (similarity >= similarityThreshold) {
        cluster.push(snapshot);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push([snapshot]);
    }
  }

  return clusters;
}

export function calculateAveragePlacement(cluster: TftMatchSnapshot[]): number {
  const total = cluster.reduce((sum, snapshot) => sum + snapshot.placement, 0);
  return total / cluster.length;
}

export function calculateTop4Rate(cluster: TftMatchSnapshot[]): number {
  const top4Count = cluster.filter((snapshot) => snapshot.placement <= 4).length;
  return top4Count / cluster.length;
}

export function calculateWinRate(cluster: TftMatchSnapshot[]): number {
  const winCount = cluster.filter((snapshot) => snapshot.placement === 1).length;
  return winCount / cluster.length;
}

export function calculateAverageLevel(cluster: TftMatchSnapshot[]): number {
  const total = cluster.reduce((sum, snapshot) => sum + snapshot.level, 0);
  return total / cluster.length;
}

export function calculateUnitFrequency(cluster: TftMatchSnapshot[]): UnitFrequencyEntry[] {
  const map = new Map<string, { characterId: string; name: string; count: number }>();

  for (const snapshot of cluster) {
    const seen = new Set<string>();

    for (const unit of snapshot.units) {
      if (!unit.characterId || seen.has(unit.characterId)) continue;

      seen.add(unit.characterId);

      const existing = map.get(unit.characterId);

      if (existing) {
        existing.count += 1;
      } else {
        map.set(unit.characterId, {
          characterId: unit.characterId,
          name: unit.name,
          count: 1,
        });
      }
    }
  }

  return [...map.values()]
    .map((entry) => ({
      ...entry,
      frequency: entry.count / cluster.length,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

export function calculateTraitFrequency(cluster: TftMatchSnapshot[]): TraitFrequencyEntry[] {
  const map = new Map<string, { name: string; count: number; totalTier: number }>();

  for (const snapshot of cluster) {
    const activeTraits = getActiveTraits(snapshot.traits);
    const seen = new Set<string>();

    for (const trait of activeTraits) {
      if (!trait.name || seen.has(trait.name)) continue;

      seen.add(trait.name);

      const existing = map.get(trait.name);

      if (existing) {
        existing.count += 1;
        existing.totalTier += trait.tierCurrent;
      } else {
        map.set(trait.name, {
          name: trait.name,
          count: 1,
          totalTier: trait.tierCurrent,
        });
      }
    }
  }

  return [...map.values()]
    .map((entry) => ({
      name: entry.name,
      count: entry.count,
      frequency: entry.count / cluster.length,
      averageTier: entry.totalTier / entry.count,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

export function calculateAugmentFrequency(cluster: TftMatchSnapshot[]): AugmentFrequencyEntry[] {
  const map = new Map<string, number>();

  for (const snapshot of cluster) {
    const uniqueAugments = [...new Set(snapshot.augments.filter(Boolean))];

    for (const augment of uniqueAugments) {
      map.set(augment, (map.get(augment) || 0) + 1);
    }
  }

  return [...map.entries()]
    .map(([name, count]) => ({
      name,
      count,
      frequency: count / cluster.length,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

export function calculateCompScore(params: {
  top4Rate: number;
  winRate: number;
  averagePlacement: number;
}): number {
  const placementScore = (8 - params.averagePlacement) / 8;

  return (
    params.top4Rate * 0.5 +
    params.winRate * 0.35 +
    placementScore * 0.15
  );
}

export function getTierFromScore(score: number): "S" | "A" | "B" | "C" {
  if (score >= 0.78) return "S";
  if (score >= 0.68) return "A";
  if (score >= 0.58) return "B";
  return "C";
}

export function inferCompName(cluster: TftMatchSnapshot[]): string {
  const unitFrequency = calculateUnitFrequency(cluster);
  const traitFrequency = calculateTraitFrequency(cluster);

  const mainTrait = traitFrequency[0]?.name ?? "Flex";
  const mainCarry = unitFrequency[0]?.name ?? "Comp";

  return `${mainTrait} ${mainCarry}`;
}

export function buildCompId(name: string, patch: string, index: number): string {
  return `${patch}-${name.toLowerCase().replace(/\s+/g, "-")}-${index}`;
}