-- CreateTable
CREATE TABLE "Summoner" (
    "id" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileIconId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Summoner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Summoner_puuid_key" ON "Summoner"("puuid");
