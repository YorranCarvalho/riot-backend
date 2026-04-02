import { Router } from "express";
import { getSummonerByRiotId } from "../controllers/summoner.controller";
import { getFullProfile, getMatchDetailsByMatchId } from "../controllers/matchController";


const router = Router();

router.get("/profile/:name/:tag", getFullProfile);
router.get("/match/:matchId/:puuid", getMatchDetailsByMatchId);
router.get("/:name/:tag", getSummonerByRiotId);

export default router;