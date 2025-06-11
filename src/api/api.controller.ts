import { Request, Response } from "express";
import { filter, firstValueFrom, map, timeout } from "rxjs";

import { logger } from "../logger";
import { AlpitronicHyc300 } from "../models";
import { AuthorizationStatus, AuthorizeConf, ChargePointStatus } from "../ocpp";
import { Simulator } from "../simulator";
import { ALPITRONIC_MODELS, CHARGERS, VENDORS } from "../utils";

export class ApiController {
  private simulator: Simulator;

  public async connectSimulator(req: Request, res: Response): Promise<void> {
    if (!!this.simulator) {
      res.status(400).json({ message: "Simulator is already connected" });
      return;
    }

    const { vendor, chargePointIdentity, webSocketUrl, chargePointSerialNumber, model } = req.body;

    if (vendor.toLocaleLowerCase() === VENDORS.ALPITRONIC.toLocaleLowerCase()) {
      const connectModel = CHARGERS.ALPITRONIC.models.find(
        (m) => m.toLocaleLowerCase() === model.toLocaleLowerCase()
      );

      switch (connectModel) {
      case ALPITRONIC_MODELS.HYC_300:
        this.simulator = new AlpitronicHyc300({
          chargePointIdentity,
          webSocketUrl,
          chargePointSerialNumber,
        });

        await this.simulator.start();
        res.status(200).json({ status: "Connected" });
        return;
      default:
        res.status(400).json({ message: "Invalid model." });
        return;
      }
    }

    res.status(400).json({ message: "Invalid vendor." });
  };

  public disconnectSimualtor (_: Request, res: Response): void {
    if (!this.simulator || !this.simulator.isOnline) {
      res.status(400).json({ message: "Simulator is not connected" });
      return;
    }

    this.simulator.stop();
    this.simulator = null;
    res.status(200).json({ status: "Disconnected" });
  };

  public async runTransaction(req: Request, res: Response): Promise<void> {
    if (!this.simulator || !this.simulator.isOnline) {
      res.status(400).json({ message: "Simulator is not connected." });
      return;
    }

    const { connectorId, idTag } = req.body;
    const connectorStatus = this.simulator.getConnectorStatus(connectorId);

    if (connectorStatus !== ChargePointStatus.AVAILABLE) {
      res.status(400).send({ message: "Connector is not available." });
      return;
    }

    const [,messageId] = this.simulator.initAuthorization({ idTag });

    try {
      const ocppResponse = await firstValueFrom(
        this.simulator.ocppResponse$.pipe(
          filter(([, id]) => id === messageId),
          map(([, , payload]) => payload as AuthorizeConf),
          timeout(10000)
        )
      );

      if (ocppResponse?.idTagInfo?.status === AuthorizationStatus.ACCEPTED) {
        res.status(400).json(ocppResponse);
        return;
      }

      res.status(200).json(ocppResponse);
    } catch (error) {
      logger.error("Authorization failed or timed out", { error });
      res.status(500).json({ message: "Authorization failed or timed out" });
    }  
  };
}
