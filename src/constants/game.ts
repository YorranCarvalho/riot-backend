export const DDRAGON_VERSION = "16.7.1";

export const getProfileIconUrl = (iconId: number) =>
  `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${iconId}.png`;

export const getChampionIconUrl = (champion: string) =>
  `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${champion}.png`;

export const getItemIconUrl = (itemId: number) =>
  itemId
    ? `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png`
    : "";