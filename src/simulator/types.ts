import { ConnectorType } from "../connector";
import { KeyValue, OcppMessageAction } from "../ocpp";

export type SimulatorOptions = {
  configuration: KeyValue[];
  webSocketUrl: string;
  chargePointIdentity: string;
  model: string;
  vendor: string;
  connectors: { type: ConnectorType }[];
}

export type OcppRequestEvent = {
  action: OcppMessageAction;
  payload?: unknown;
}
