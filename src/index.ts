 
import * as dotenv from "dotenv";
import express from "express";

import { logger } from "./logger";

dotenv.config();

const HTTP_PORT = process.env.HTTP_PORT || 8000;

const app = express();

app.post("/connect", (req, res) => {
  res.send("ok");
});

app.post("/disconnect", (req, res) => {
  res.send("ok");
});

app.listen(HTTP_PORT, () => {
  logger.info(`App is running on port ${HTTP_PORT}`);
});
