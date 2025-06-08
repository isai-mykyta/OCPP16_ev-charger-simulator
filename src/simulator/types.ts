import { ConnectorType } from "../connector";
import { KeyValue } from "../ocpp";

export type SimulatorOptions = {
  configuration: KeyValue[];
  webSocketUrl: string;
  chargePointIdentity: string;
  model: string;
  vendor: string;
  chargePointSerialNumber: string;
  connectors: { 
    type: ConnectorType, 
    maxCurrent: number 
  }[];
}
