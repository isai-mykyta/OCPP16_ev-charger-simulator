import WebSocket from "ws";

import { logger } from "../logger";
import { OcppService, OcppMessage } from "../ocpp";
import { ConnectOptions } from "./types";
import { simulatorsRegistry } from "../registry";

export class WebSocketService {
  private wsClient: WebSocket;
  private pingInterval: NodeJS.Timeout;
  private webSocketPingInterval: number;
  private ocppService: OcppService;
  private identity: string;

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.wsClient.ping();
    }, this.webSocketPingInterval * 1000);
  }

  private clear(): void {
    this.wsClient = null;
    this.webSocketPingInterval = null;
    this.ocppService = null;
    this.identity = null;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private onOpen(): void {
    const simulator = simulatorsRegistry.getSimulator(this.identity);
    if (simulator) simulator.isOnline = true;

    logger.info("WebSocket connection is opened");
    this.startPingInterval();
    const bootRequest = this.ocppService.bootNotificationReq();
    this.sendRequest(JSON.stringify(bootRequest));
  }

  private onPing(): void {
    this.wsClient.pong();
  }

  private onClose(): void {
    const simulator = simulatorsRegistry.getSimulator(this.identity);
    if (simulator) simulator.isOnline = false;

    logger.warn("WebSocket connection is closed");
    this.clear();
  } 

  private onError(error: Error): void {
    logger.error("WS error occured", { error });
  }

  private send(message: string): void {
    this.wsClient.send(message);
  }

  private sendRequest(message: string): void {
    const simulator = simulatorsRegistry.getSimulator(this.identity);
    this.send(message);
    simulator.storePendingRequest(JSON.parse(message));
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

  public connect(options: ConnectOptions): void {
    this.webSocketPingInterval = options.webSocketPingInterval;
    this.identity = options.identity;

    this.ocppService = new OcppService(this.identity);
    this.wsClient = new WebSocket(`${options.webSocketUrl}/${this.identity}`, "ocpp1.6");

    this.wsClient.on("open", this.onOpen.bind(this));
    this.wsClient.on("ping", this.onPing.bind(this));
    this.wsClient.on("close", this.onClose.bind(this));
    this.wsClient.on("error", this.onError.bind(this));
    this.wsClient.on("message", this.onMessage.bind(this));
  }

  public disconnect(): void {
    const simulator = simulatorsRegistry.getSimulator(this.identity);
    if (simulator) simulator.isOnline = false;

    this.wsClient.close();
    this.clear();
  }
}
