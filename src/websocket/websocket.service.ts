import WebSocket from "ws";

import { logger } from "../logger";
import { OcppService, OcppMessage } from "../ocpp";
import { WebSocketOptions } from "./types";
import { Simulator } from "../simulator";

export class WebSocketService {
  private wsClient: WebSocket;
  private pingInterval: NodeJS.Timeout;
  private webSocketPingInterval: number;
  private ocppService: OcppService;
  private simulator: Simulator;

  constructor (options: WebSocketOptions) {
    this.simulator = options.simulator;
    this.webSocketPingInterval = options.webSocketPingInterval;
    this.ocppService = new OcppService(this.simulator);

    this.ocppService.ocppRequest$.subscribe((request) => {
      this.sendRequest(JSON.stringify(request));
    });

    this.ocppService.ocppResponse$.subscribe((response) => {
      this.send(JSON.stringify(response));
    });
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

  private sendRequest(message: string): void {
    this.send(message);
    this.simulator.storePendingRequest(JSON.parse(message));
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

    this.ocppService.handleMessage(parsedMessage);
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
}
