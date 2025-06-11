import { Router } from "express";

import { connectSimulator, disconnectSimualtor, runTransaction } from "./api.controller";
import { connectMiddleware, startTransactionMiddleware } from "./api.middleware";

const apiRouter = Router();

apiRouter.post("/connect", connectMiddleware, connectSimulator);
apiRouter.post("/disconnect", disconnectSimualtor);
apiRouter.post("/run-transaction", startTransactionMiddleware, runTransaction);

export { apiRouter };
