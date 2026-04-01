import { Router } from "express";
import { getSummonerByRiotId } from "../controllers/summoner.controller";
import { getFullProfile } from "../controllers/matchController";


const router = Router();

router.get("/profile/:name/:tag", getFullProfile);
router.get("/:name/:tag", getSummonerByRiotId);

export default router;