import { Request, Response } from "express";
import { TftMetaCompsService } from "../services/tft-meta-comps.service";
import { TftMatchSnapshot } from "../types/tft-match-snapshot.type";

const tftMetaCompsService = new TftMetaCompsService();

export class TftMetaCompsController {
  detect = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        snapshots,
        patch,
        minGames,
        similarityThreshold,
        topPlacementOnly,
      }: {
        snapshots: TftMatchSnapshot[];
        patch?: string;
        minGames?: number;
        similarityThreshold?: number;
        topPlacementOnly?: boolean;
      } = req.body;

      if (!snapshots || !Array.isArray(snapshots)) {
        return res.status(400).json({
          error: "O campo snapshots é obrigatório e deve ser um array.",
        });
      }

      const result = tftMetaCompsService.execute({
        snapshots,
        patch,
        minGames,
        similarityThreshold,
        topPlacementOnly,
      });

      return res.status(200).json({
        total: result.length,
        comps: result,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao detectar comps de TFT.",
        details: error instanceof Error ? error.message : error,
      });
    }
  };

  detectFromPuuid = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        puuid,
        start,
        count,
        patch,
        minGames,
        similarityThreshold,
        topPlacementOnly,
      }: {
        puuid: string;
        start?: number;
        count?: number;
        patch?: string;
        minGames?: number;
        similarityThreshold?: number;
        topPlacementOnly?: boolean;
      } = req.body;

      if (!puuid) {
        return res.status(400).json({
          error: "O campo puuid é obrigatório.",
        });
      }

      const result = await tftMetaCompsService.executeFromMatches({
        puuid,
        start,
        count,
        patch,
        minGames,
        similarityThreshold,
        topPlacementOnly,
      });

      return res.status(200).json({
        total: result.length,
        comps: result,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao detectar comps a partir das partidas TFT.",
        details: error instanceof Error ? error.message : error,
      });
    }
  };
}