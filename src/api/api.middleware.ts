import { NextFunction, Request, Response } from "express";

import { CHARGERS, validateDto } from "../utils";
import { ConnectSimulatorRequestDto, StartTransactionRequestDto } from "./api.dtos";

export const connectMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const { isValid, errors} = validateDto(req.body, ConnectSimulatorRequestDto);

  if (!isValid) {
    res.status(400).send(errors);
    return;
  }

  const charger = Object.values(CHARGERS).find((charger) => 
    charger.vendor.toLocaleLowerCase() === req.body.vendor.toLocaleLowerCase()
  );

  if (!charger) {
    res.status(400).send({ message: "Invalid vendor." });
    return;
  }

  const isValidModel = charger.models.includes(req.body.model.toLocaleLowerCase());

  if (!isValidModel) {
    res.status(400).send({ message: "Invalid model." });
    return;
  }

  next();
};

export const startTransactionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const { isValid, errors} = validateDto(req.body, StartTransactionRequestDto);

  if (!isValid) {
    res.status(400).send(errors);
    return;
  }

  next();
};
