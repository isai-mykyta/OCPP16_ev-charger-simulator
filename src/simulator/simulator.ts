import { ConfigurationService } from "../configuration";
import { SimulatorOptions } from "./types";
import { WebSocketService } from "../websocket/websocket.service";

export abstract class Simulator {
  private readonly webSocketUrl: string;
  private readonly chargePointIdentity: string;
  private readonly wsService: WebSocketService;
  private readonly configService: ConfigurationService;

  constructor (options: SimulatorOptions) {
    this.webSocketUrl = options.webSocketUrl;
    this.chargePointIdentity = options.chargePointIdentity;

    this.wsService = new WebSocketService();
    this.configService = new ConfigurationService(options.configs);
  }

  public start(): void {
    this.wsService.connect({
      cpmsUrl: this.webSocketUrl,
      chargePointIdentity: this.chargePointIdentity,
      webSocketPingInterval: Number(this.configService.findConfigByKey("WebSocketPingInterval").value)
    });
  }

  public stop(): void {
    this.wsService.disconnect();
  }
}
