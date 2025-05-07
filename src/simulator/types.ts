import { KeyValue } from "../configuration";

export type SimulatorOptions = {
  configs: KeyValue[];
  webSocketUrl: string;
  chargePointIdentity: string;
}
