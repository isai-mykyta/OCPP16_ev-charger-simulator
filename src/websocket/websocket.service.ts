import WebSocket from "ws";

import { eventsService } from "../events/events.service";
import { logger } from "../logger";
import { OcppService, OcppMessage } from "../ocpp";
import { simulatorsRegistry, SimulatorState } from "../simulator-registry";

export class WebSocketService {
  private wsClient: WebSocket;
  private pingInterval: NodeJS.Timeout;
  private webSocketPingInterval: number;
  private ocppService: OcppService;

  private readonly simulator: SimulatorState;

  constructor (identity: string) {
    this.simulator = simulatorsRegistry.getSimulator(identity);
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.wsClient.ping();
    }, this.webSocketPingInterval * 1000);
  }

  private clear(): void {
    this.wsClient = null;
    this.webSocketPingInterval = null;
    this.ocppService = null;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private onOpen(): void {
    const identity = this.simulator.configuration.findConfigByKey("ChargePointIdentity").value;
    logger.info("WebSocket connection is opened");
    
    this.startPingInterval();
    eventsService.emit("simulatorConnected", { identity });

    const bootRequest = this.ocppService.bootNotificationReq();
    this.sendRequest(JSON.stringify(bootRequest));
  }

  private onPing(): void {
    this.wsClient.pong();
  }

  private onClose(): void {
    const identity = this.simulator.configuration.findConfigByKey("ChargePointIdentity").value;
    logger.warn("WebSocket connection is closed");
    eventsService.emit("simulatorDisconnected", { identity });
    this.clear();
  } 

  private onError(error: Error): void {
    logger.error("WS error occured", { error });
  }

  private send(message: string): void {
    this.wsClient.send(message);
  }

  private sendRequest(message: string): void {
    this.send(message);
    eventsService.emit("ocppResponseReceived", { message: JSON.parse(message) });
  }

  private onMessage(data: WebSocket.RawData): void {
    const message = data.toString();
    logger.info("WebSocket message received", { message });

    let parsedMessage: OcppMessage<unknown>;

    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      logger.error("Failed to parse incoming WS message");
    }

    const response = this.ocppService.handleMessage(parsedMessage);

    if (response) {
      this.send(JSON.stringify(response));
      return;
    }
  }

  public connect(): void {
    this.webSocketPingInterval = Number(this.simulator.configuration.findConfigByKey("WebSocketPingInterval")?.value) || 60;
    const identity = this.simulator.configuration.findConfigByKey("ChargePointIdentity").value;
    const cpmsUrl = this.simulator.configuration.findConfigByKey("WebSocketUrl").value;

    this.ocppService = new OcppService({ identity });
    this.wsClient = new WebSocket(`${cpmsUrl}/${identity}`, "ocpp1.6");

    this.wsClient.on("open", this.onOpen.bind(this));
    this.wsClient.on("ping", this.onPing.bind(this));
    this.wsClient.on("close", this.onClose.bind(this));
    this.wsClient.on("error", this.onError.bind(this));
    this.wsClient.on("message", this.onMessage.bind(this));
  }

  public disconnect(): void {
    const identity = this.simulator.configuration.findConfigByKey("ChargePointIdentity").value;
    this.wsClient.close();
    eventsService.emit("simulatorDisconnected", { identity });
    this.clear();
  }
}
