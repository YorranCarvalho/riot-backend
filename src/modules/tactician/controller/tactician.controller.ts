import { Request, Response } from "express";
import { TacticianProfileService } from "../services/tactician-profile.service";

const tacticianProfileService = new TacticianProfileService();

export class TacticianController {
  async getProfile(req: Request, res: Response) {
    try {
      const { gameName, tagLine } = req.params;

      const data = await tacticianProfileService.execute({
        gameName,
        tagLine,
      });

      return res.json(data);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao montar perfil tactician",
        details: error?.response?.data || error?.message,
      });
    }
  }
}