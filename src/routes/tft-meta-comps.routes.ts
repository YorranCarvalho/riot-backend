import { Router } from "express";
import { TftMetaCompsController } from "../modules/tactician/controller/tft-meta-comps.controller";

const tftMetaCompsRoutes = Router();
const controller = new TftMetaCompsController();

tftMetaCompsRoutes.post("/detect", controller.detect);
tftMetaCompsRoutes.post("/from-puuid", controller.detectFromPuuid);

export default tftMetaCompsRoutes;