import { Router } from "express";
import { ScoutController } from "../modules/scout/controller/scout.controller";

const router = Router();
const controller = new ScoutController();

router.get("/:name/:tag", controller.getProfile.bind(controller));
router.post("/:name/:tag/refresh", controller.refreshProfile.bind(controller));
router.get("/match/:matchId/:puuid", controller.getMatchDetails.bind(controller));

export default router;