import { ConfigurationService } from "../configuration";
import { SimulatorOptions } from "./types";
import { eventsService } from "../events/events.service";
import { WebSocketService } from "../websocket/websocket.service";

export abstract class Simulator {
  public readonly webSocketUrl: string;
  public readonly chargePointIdentity: string;
  
  private readonly wsService: WebSocketService;
  private readonly configService: ConfigurationService;

  constructor (options: SimulatorOptions) {
    this.webSocketUrl = options.webSocketUrl;
    this.chargePointIdentity = options.chargePointIdentity;

    this.wsService = new WebSocketService();
    this.configService = new ConfigurationService(options.configs);

    eventsService.emit("simulatorCreated", { 
      identity: this.chargePointIdentity, 
      cpmsUrl: this.webSocketUrl 
    });
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
