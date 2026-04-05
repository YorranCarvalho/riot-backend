export type TftMetaCompUnitDto = {
  characterId: string;
  name: string;
  frequency: number;
};

export type TftMetaCompTraitDto = {
  name: string;
  averageTier: number;
  frequency: number;
};

export type TftDetectedCompDto = {
  id: string;
  name: string;
  tier: "S" | "A" | "B" | "C";
  patch: string;
  games: number;
  averagePlacement: number;
  top4Rate: number;
  winRate: number;
  averageLevel: number;
  coreUnits: TftMetaCompUnitDto[];
  flexUnits: TftMetaCompUnitDto[];
  traits: TftMetaCompTraitDto[];
  augments: { name: string; frequency: number }[];
  sampleMatchIds: string[];
};