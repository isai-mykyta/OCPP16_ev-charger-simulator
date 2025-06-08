 
import * as dotenv from "dotenv";
import express from "express";

import { apiRouter } from "./api";
import { logger } from "./logger";

dotenv.config();

const HTTP_PORT = process.env.HTTP_PORT || 8000;

const app = express();

app.use(apiRouter);

app.listen(HTTP_PORT, () => {
  logger.info(`App is running on port ${HTTP_PORT}`);
});
