-- CreateTable
CREATE TABLE "PlayerScore" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "performanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kdaScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "csScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "damageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goldScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "visionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winRateScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deathScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consistencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerScore_playerId_key" ON "PlayerScore"("playerId");

-- AddForeignKey
ALTER TABLE "PlayerScore" ADD CONSTRAINT "PlayerScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
