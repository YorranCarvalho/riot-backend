export type TftTraitSnapshot = {
  name: string;
  tierCurrent: number;
  tierTotal?: number;
  style?: number;
};

export type TftUnitSnapshot = {
  characterId: string;
  name: string;
  tier?: number;
  rarity?: number;
  itemNames?: string[];
};

export type TftMatchSnapshot = {
  matchId: string;
  puuid: string;
  placement: number;
  level: number;
  patch: string;
  set: number;
  units: TftUnitSnapshot[];
  traits: TftTraitSnapshot[];
  augments: string[];
};