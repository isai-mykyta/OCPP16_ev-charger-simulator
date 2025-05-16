import { configuration } from "./config";
import { Simulator } from "../../simulator";
import { SimulatorOptions } from "../../types";

export class BaseSimulatorModel extends Simulator {
  constructor (options: Pick<SimulatorOptions, "chargePointIdentity" | "webSocketUrl">) {
    super({ 
      ...options, 
      configs: configuration, 
      model: "Test-Model", 
      vendor: "Base-Simulator" 
    });
  }
}
