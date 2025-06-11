import { Request, Response } from "express";

import { AlpitronicHyc300 } from "../models";
import { ChargePointStatus } from "../ocpp";
import { Simulator } from "../simulator";
import { ALPITRONIC_MODELS, CHARGERS, VENDORS } from "../utils";

let simulator: Simulator;

export const connectSimulator = async (req: Request, res: Response): Promise<void> => {
  if (!!simulator) {
    res.status(400).send({ message: "Simulator is already connected" });
    return;
  }

  const { vendor, chargePointIdentity, webSocketUrl, chargePointSerialNumber, model } = req.body;

  if (vendor.toLocaleLowerCase() === VENDORS.ALPITRONIC.toLocaleLowerCase()) {
    const connectModel = CHARGERS.ALPITRONIC.models.find(
      (m) => m.toLocaleLowerCase() === model.toLocaleLowerCase()
    );

    switch (connectModel) {
    case ALPITRONIC_MODELS.HYC_300:
      simulator = new AlpitronicHyc300({
        chargePointIdentity,
        webSocketUrl,
        chargePointSerialNumber,
      });

      await simulator.start();
      res.status(200).send({ status: "Connected" });
      return;
    default:
      res.status(400).send({ message: "Invalid model." });
      return;
    }
  }

  res.status(400).send({ message: "Invalid vendor." });
};

export const disconnectSimualtor = (_: Request, res: Response): void => {
  if (!simulator || !simulator.isOnline) {
    res.status(400).send({ message: "Simulator is not connected" });
    return;
  }

  simulator.stop();
  simulator = null;
  res.status(200).send({ status: "Disconnected" });
};

export const runTransaction = (req: Request, res: Response): void => {
  if (!simulator || !simulator.isOnline) {
    res.status(400).send({ message: "Simulator is not connected." });
    return;
  }

  const connectorStatus = simulator.getConnectorStatus(req.body.connectorId);

  if (connectorStatus !== ChargePointStatus.AVAILABLE) {
    res.status(400).send({ message: "Connector is not available." });
    return;
  }

  res.status(200).send();
};
