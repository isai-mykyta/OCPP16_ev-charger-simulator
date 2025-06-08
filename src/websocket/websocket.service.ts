import WebSocket from "ws";

import { logger } from "../logger";
import { OcppHandlerService, OcppMessage } from "../ocpp";
import { WebSocketOptions } from "./types";
import { Simulator } from "../simulator";

export class WebSocketService {
  private wsClient: WebSocket;
  private pingInterval: NodeJS.Timeout;
  private webSocketPingInterval: number;
  private ocppHandlerService: OcppHandlerService;
  private simulator: Simulator;

  constructor (options: WebSocketOptions) {
    this.simulator = options.simulator;
    this.webSocketPingInterval = options.webSocketPingInterval;
    this.ocppHandlerService = new OcppHandlerService(this.simulator);
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.wsClient.ping();
    }, this.webSocketPingInterval * 1000);
  }

  private clear(): void {
    this.wsClient = null;
    this.webSocketPingInterval = null;
    this.ocppHandlerService = null;
    this.simulator = null;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private onOpen(): void {
    this.simulator.isOnline = true;
    logger.info("WebSocket connection is opened");
    this.startPingInterval();
  }

  private onPing(): void {
    this.wsClient.pong();
  }

  private onClose(): void {
    this.simulator.isOnline = false;
    logger.warn("WebSocket connection is closed");
    this.clear();
  } 

  private onError(error: Error): void {
    logger.error("WS error occured", { error });
  }

  private send(message: string): void {
    this.wsClient.send(message);
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

    const response = this.ocppHandlerService.handleMessage(parsedMessage);

    if (response) {
      this.send(JSON.stringify(response));
    }
  }

  public connect(): void {
    this.wsClient = new WebSocket(`${this.simulator.webSocketUrl}/${this.simulator.identity}`, "ocpp1.6");

    this.wsClient.on("open", this.onOpen.bind(this));
    this.wsClient.on("ping", this.onPing.bind(this));
    this.wsClient.on("close", this.onClose.bind(this));
    this.wsClient.on("error", this.onError.bind(this));
    this.wsClient.on("message", this.onMessage.bind(this));
  }

  public disconnect(): void {
    this.wsClient?.close();
  }

  public sendRequest(message: string): void {
    this.send(message);
    this.simulator.storePendingRequest(JSON.parse(message));
  }
}
