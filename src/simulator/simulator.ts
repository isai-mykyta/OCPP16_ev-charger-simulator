import { ConfigurationService } from "../configuration";
import { SimulatorOptions } from "./types";
import { WebSocketService } from "../websocket/websocket.service";

export abstract class Simulator {
  private readonly wsService = new WebSocketService();
  private readonly configService: ConfigurationService;

  constructor (options: SimulatorOptions) {
    this.configService = new ConfigurationService(options.configs);
  }
}
