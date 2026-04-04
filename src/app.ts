import express from "express";
import cors from "cors";
import helmet from "helmet";
import scoutRoutes from "./routes/scout.routes";
import tacticianRoutes from "./routes/tactician.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/scout", scoutRoutes);
app.use("/tactician", tacticianRoutes);

export default app;