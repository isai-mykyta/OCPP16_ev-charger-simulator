import { Request, Response } from "express";

import { AlpitronicHyc300 } from "../models";
import { ChargePointStatus } from "../ocpp";
import { Simulator } from "../simulator";
import { ALPITRONIC_MODELS, CHARGERS, VENDORS } from "../utils";

export class ApiController {
  private simulator: Simulator;

  public async connectSimulator(req: Request, res: Response): Promise<void> {
    if (!!this.simulator) {
      res.status(400).send({ message: "Simulator is already connected" });
      return;
    }

    if (req.body.vendor.toLocaleLowerCase() === VENDORS.ALPITRONIC) {
      const connectModel = CHARGERS.ALPITRONIC.models.find((m) => m.toLocaleLowerCase() === req.body.model.toLocaleLowerCase());

      switch (connectModel) {
      case ALPITRONIC_MODELS.HYC_300:
        this.simulator = new AlpitronicHyc300({
          chargePointIdentity: req.body.chargePointIdentity,
          webSocketUrl: req.body.webSocketUrl,
          chargePointSerialNumber: req.body.chargePointSerialNumber,
        });

        await this.simulator.start();
        res.status(200).send({ status: "Connected" });
        return;
      default:
        res.status(400).send({ message: "Invalid model." });
        return;
      }
    }

    res.status(400).send({ message: "Invalid vendor." });
  }

  public disconnectSimualtor(_: Request, res: Response): void {
    if (!this.simulator || !this.simulator.isOnline) {
      res.status(400).send({ message: "Simulator is not connected" });
      return;
    }

    this.simulator.stop();
    this.simulator = null;
    res.status(200).send({ status: "Disconnected" });
  }

  public startTransaction(req: Request, res: Response): void {
    if (!this.simulator || !this.simulator.isOnline) {
      res.status(400).send({ message: "Simulator is not connected." });
      return;
    }

    const connectorStatus = this.simulator.getConnectorStatus(req.body.connectorId);

    if (connectorStatus !== ChargePointStatus.AVAILABLE) {
      res.status(400).send({ message: "Connector is not available." });
      return;
    }

    res.status(200).send({});
  }
}
