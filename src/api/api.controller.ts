import { Request, Response } from "express";
import { filter, firstValueFrom, map, timeout } from "rxjs";

import { logger } from "../logger";
import { AlpitronicHyc300 } from "../models";
import { AuthorizationStatus, AuthorizeConf, ChargePointStatus } from "../ocpp";
import { Simulator } from "../simulator";
import { ALPITRONIC_MODELS, CHARGERS, VENDORS } from "../utils";

let simulator: Simulator;

export const connectSimulator = async (req: Request, res: Response): Promise<void> => {
  if (!!simulator) {
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
      simulator = new AlpitronicHyc300({
        chargePointIdentity,
        webSocketUrl,
        chargePointSerialNumber,
      });

      await simulator.start();
      res.status(200).json({ status: "Connected" });
      return;
    default:
      res.status(400).json({ message: "Invalid model." });
      return;
    }
  }

  res.status(400).json({ message: "Invalid vendor." });
};

export const disconnectSimualtor = (_: Request, res: Response): void => {
  if (!simulator || !simulator.isOnline) {
    res.status(400).json({ message: "Simulator is not connected" });
    return;
  }

  simulator.stop();
  simulator = null;
  res.status(200).json({ status: "Disconnected" });
};

export const runTransaction = async (req: Request, res: Response): Promise<void> => {
  if (!simulator || !simulator.isOnline) {
    res.status(400).json({ message: "Simulator is not connected." });
    return;
  }

  const { connectorId, idTag } = req.body;
  const connectorStatus = simulator.getConnectorStatus(connectorId);

  if (connectorStatus !== ChargePointStatus.AVAILABLE) {
    res.status(400).send({ message: "Connector is not available." });
    return;
  }

  const [,messageId] = simulator.initAuthorization({ idTag });

  try {
    const ocppResponse = await firstValueFrom(
      simulator.ocppResponse$.pipe(
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
