import { ConfigurationService } from "../configuration";
import { SimulatorOptions } from "./types";
import { WebSocketService } from "../websocket/websocket.service";

export abstract class Simulator {
  private readonly wsService = new WebSocketService();
  private readonly configService: ConfigurationService;

  constructor (options: SimulatorOptions) {
    this.configService = new ConfigurationService(options.configs);
  }

  public start(): void {
    const cpmsUrl = this.configService.findConfigByKey("WebSocketUrl").value;
    const chargePointIdentity = this.configService.findConfigByKey("ChargePointIdentity").value;
    const webSocketPingInterval = Number(this.configService.findConfigByKey("WebSocketPingInterval").value);

    this.wsService.connect({
      cpmsUrl,
      chargePointIdentity,
      webSocketPingInterval
    });
  }

  public stop(): void {
    this.wsService.disconnect();
  }
}
