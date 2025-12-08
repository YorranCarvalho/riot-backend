import express from "express";
import cors from "cors";
import helmet from "helmet";
import SummonerRoutes from "./routes/summoner.routes";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/summoner", SummonerRoutes);

export default app;