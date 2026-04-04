import { Router } from "express";
import { TacticianController } from "../modules/tactician/controller/tactician.controller";

const router = Router();
const controller = new TacticianController();

router.get("/:gameName/:tagLine", controller.getProfile.bind(controller));

export default router;