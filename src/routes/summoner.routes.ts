import { Router } from "express";
import { getSummonerByRiotId } from "../controllers/summoner.controller";
import { 
  getMatchesByPuuid,
  getMatchDetails,
  getChampionMastery,
  getMostPlayedRole,
  getFullProfile
} from "../controllers/matchController";

const router = Router();

router.get("/:name/:tag", getSummonerByRiotId);
router.get("/matches/:puuid", getMatchesByPuuid);
router.get("/match/:matchId", getMatchDetails);
router.get("/mastery/:puuid", getChampionMastery);
router.get("/roles/:puuid", getMostPlayedRole);
router.get("/profile/:name/:tag", getFullProfile);

export default router;
