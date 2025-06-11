import { Router } from "express";

import { ApiController } from "./api.controller";
import { connectMiddleware, startTransactionMiddleware } from "./api.middleware";

const apiController = new ApiController();
const apiRouter = Router();

apiRouter.post("/connect", connectMiddleware, apiController.connectSimulator);
apiRouter.post("/disconnect", apiController.disconnectSimualtor);
apiRouter.post("/run-transaction", startTransactionMiddleware, apiController.runTransaction);

export { apiRouter };
