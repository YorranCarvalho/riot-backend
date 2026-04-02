import express from "express";
import cors from "cors";
import helmet from "helmet";
import scoutRoutes from "./routes/scout.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/scout", scoutRoutes);

export default app;