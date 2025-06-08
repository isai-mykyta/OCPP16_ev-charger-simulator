import { Request, Response } from "express";

import { Simulator } from "../simulator";
import { ALPITRONIC_MODELS, CHARGERS, VENDORS } from "../utils";

export class ApiController {
  private readonly simulator: Simulator;

  public connectSimulator(req: Request, res: Response): void {
    if (!!this.simulator) {
      res.status(400).send({ message: "Simulator is already connected" });
      return;
    }

    if (req.body.vendor.toLocaleLowerCase() === VENDORS.ALPITRONIC) {
      const model = CHARGERS.ALPITRONIC.models.find((m) => m.toLocaleLowerCase() === req.body.model.toLocaleLowerCase());

      switch (model) {
      case ALPITRONIC_MODELS.HYC_300:
        break;
      default:
        break;
      }
    } 
  }

  public disconnectSimualtor(req: Request, res: Response): void {
    if (!this.simulator) {
      res.status(400).send({ message: "Simulator is not connected" });
      return;
    }
  }
}
