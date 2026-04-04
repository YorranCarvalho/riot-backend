-- CreateTable
CREATE TABLE "TacticianProfile" (
    "id" SERIAL NOT NULL,
    "puuid" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "summonerId" TEXT,
    "accountId" TEXT,
    "profileIconId" INTEGER,
    "summonerLevel" INTEGER,
    "region" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TacticianProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TacticianRankedSnapshot" (
    "id" SERIAL NOT NULL,
    "puuid" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "tier" TEXT,
    "rank" TEXT,
    "leaguePoints" INTEGER,
    "wins" INTEGER,
    "losses" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TacticianRankedSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TacticianMatch" (
    "id" SERIAL NOT NULL,
    "matchId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "placement" INTEGER,
    "level" INTEGER,
    "lastRound" INTEGER,
    "playersEliminated" INTEGER,
    "timeEliminated" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TacticianMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TacticianProfile_puuid_key" ON "TacticianProfile"("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "TacticianMatch_matchId_key" ON "TacticianMatch"("matchId");
