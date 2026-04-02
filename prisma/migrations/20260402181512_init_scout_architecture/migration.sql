/*
  Warnings:

  - You are about to drop the `Summoner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Summoner";

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'br1',
    "profileIconId" INTEGER NOT NULL,
    "summonerLevel" INTEGER NOT NULL,
    "summonerId" TEXT,
    "accountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankedSnapshot" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "leaguePoints" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "season" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankedSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionMastery" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "championId" INTEGER NOT NULL,
    "championLevel" INTEGER NOT NULL,
    "championPoints" INTEGER NOT NULL,
    "lastPlayTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChampionMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "queueId" INTEGER NOT NULL,
    "gameCreation" TIMESTAMP(3) NOT NULL,
    "gameDuration" INTEGER NOT NULL,
    "gameVersion" TEXT,
    "mapId" INTEGER,
    "platformId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMatch" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "summonerName" TEXT,
    "riotIdGameName" TEXT,
    "riotIdTagLine" TEXT,
    "championName" TEXT NOT NULL,
    "championId" INTEGER,
    "teamId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "lane" TEXT,
    "win" BOOLEAN NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "kda" DOUBLE PRECISION NOT NULL,
    "totalCs" INTEGER NOT NULL,
    "csPerMin" DOUBLE PRECISION NOT NULL,
    "goldEarned" INTEGER NOT NULL,
    "goldPerMin" DOUBLE PRECISION NOT NULL,
    "damageToChampions" INTEGER NOT NULL,
    "damagePerMin" DOUBLE PRECISION NOT NULL,
    "visionScore" INTEGER,
    "visionPerMin" DOUBLE PRECISION,
    "champLevel" INTEGER NOT NULL,
    "item0" INTEGER NOT NULL,
    "item1" INTEGER NOT NULL,
    "item2" INTEGER NOT NULL,
    "item3" INTEGER NOT NULL,
    "item4" INTEGER NOT NULL,
    "item5" INTEGER NOT NULL,
    "item6" INTEGER NOT NULL,
    "summoner1Id" INTEGER NOT NULL,
    "summoner2Id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutProfile" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "winsLast10" INTEGER NOT NULL DEFAULT 0,
    "lossesLast10" INTEGER NOT NULL DEFAULT 0,
    "averageKdaLast10" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageCsPerMinLast10" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageDpmLast10" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageGpmLast10" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mostPlayedRole" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "championPoolSize" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoutProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_puuid_key" ON "Player"("puuid");

-- CreateIndex
CREATE INDEX "RankedSnapshot_playerId_queueType_idx" ON "RankedSnapshot"("playerId", "queueType");

-- CreateIndex
CREATE INDEX "RankedSnapshot_playerId_season_idx" ON "RankedSnapshot"("playerId", "season");

-- CreateIndex
CREATE INDEX "ChampionMastery_playerId_idx" ON "ChampionMastery"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionMastery_playerId_championId_key" ON "ChampionMastery"("playerId", "championId");

-- CreateIndex
CREATE INDEX "PlayerMatch_playerId_role_idx" ON "PlayerMatch"("playerId", "role");

-- CreateIndex
CREATE INDEX "PlayerMatch_playerId_championName_idx" ON "PlayerMatch"("playerId", "championName");

-- CreateIndex
CREATE INDEX "PlayerMatch_matchId_idx" ON "PlayerMatch"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMatch_playerId_matchId_key" ON "PlayerMatch"("playerId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoutProfile_playerId_key" ON "ScoutProfile"("playerId");

-- AddForeignKey
ALTER TABLE "RankedSnapshot" ADD CONSTRAINT "RankedSnapshot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionMastery" ADD CONSTRAINT "ChampionMastery_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatch" ADD CONSTRAINT "PlayerMatch_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatch" ADD CONSTRAINT "PlayerMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutProfile" ADD CONSTRAINT "ScoutProfile_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
