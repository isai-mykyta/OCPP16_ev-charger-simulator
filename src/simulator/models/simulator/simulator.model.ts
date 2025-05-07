import { configuration } from "./config";
import { Simulator } from "../../simulator";

export class BaseSimulatorModel extends Simulator {
  constructor () {
    super({
      configs: configuration
    });
  }
}
