import { Request, Response } from "express";
import { ScoutProfileService } from "../services/scout-profile.service";
import { ScoutMatchDetailsService } from "../services/scout-match-details.service";
import { ScoutRefreshService } from "../services/scout-refresh.service";

const scoutProfileService = new ScoutProfileService();
const scoutMatchDetailsService = new ScoutMatchDetailsService();
const scoutRefreshService = new ScoutRefreshService();

export class ScoutController {
  async getProfile(req: Request, res: Response) {
    const { name, tag } = req.params;

    try {
      const data = await scoutProfileService.execute({ name, tag });
      return res.json(data);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao montar perfil scout",
        details: error.response?.data || error.message,
      });
    }
  }

  async refreshProfile(req: Request, res: Response) {
    const { name, tag } = req.params;

    try {
      const player = await scoutRefreshService.execute({ name, tag });
      return res.json({
        success: true,
        puuid: player.puuid,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao atualizar perfil scout",
        details: error.response?.data || error.message,
      });
    }
  }

  async getMatchDetails(req: Request, res: Response) {
    const { matchId, puuid } = req.params;

    try {
      const data = await scoutMatchDetailsService.execute({ matchId, puuid });
      return res.json(data);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao buscar detalhes da partida",
        details: error.response?.data || error.message,
      });
    }
  }
}