import express from "express";
import cors from "cors";
import helmet from "helmet";
import scoutRoutes from "./routes/scout.routes";
import tacticianRoutes from "./routes/tactician.routes";
import tftMetaCompsRoutes from "./routes/tft-meta-comps.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/scout", scoutRoutes);
app.use("/tactician", tacticianRoutes);
app.use("/tft/meta-comps", tftMetaCompsRoutes);

export default app;