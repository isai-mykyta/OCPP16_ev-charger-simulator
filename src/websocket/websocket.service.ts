import WebSocket from "ws";

import { logger } from "../logger";
import { ConnectOptions } from "./types";
import { eventsService } from "../events/events.service";
import { OcppService, OcppMessage } from "../ocpp";

export class WebSocketService {
  private wsClient: WebSocket;
  private pingInterval: NodeJS.Timeout;
  private webSocketPingInterval: number;
  private chargePointIdentity: string;
  private ocppService: OcppService;

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.wsClient.ping();
    }, this.webSocketPingInterval * 1000);
  }

  private clear(): void {
    this.wsClient = null;
    this.webSocketPingInterval = null;
    this.chargePointIdentity = null;
    this.ocppService = null;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private onOpen(): void {
    logger.info("WebSocket connection is opened");
    this.startPingInterval();
    eventsService.emit("simulatorConnected", { identity: this.chargePointIdentity });
  }

  private onPing(): void {
    this.wsClient.pong();
  }

  private onClose(): void {
    logger.warn("WebSocket connection is closed");
    eventsService.emit("simulatorDisconnected", { identity: this.chargePointIdentity });
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

    const response = this.ocppService.handleMessage(parsedMessage);

    if (response) {
      this.send(JSON.stringify(response));
      return;
    }
  }

  public connect(options: ConnectOptions): void {
    this.webSocketPingInterval = options.webSocketPingInterval;
    this.chargePointIdentity = options.chargePointIdentity;

    this.ocppService = new OcppService({ identity: this.chargePointIdentity });
    this.wsClient = new WebSocket(`${options.cpmsUrl}/${options.chargePointIdentity}`, "ocpp1.6");

    this.wsClient.on("open", this.onOpen.bind(this));
    this.wsClient.on("ping", this.onPing.bind(this));
    this.wsClient.on("close", this.onClose.bind(this));
    this.wsClient.on("error", this.onError.bind(this));
    this.wsClient.on("message", this.onMessage.bind(this));
  }

  public disconnect(): void {
    this.wsClient.close();
    eventsService.emit("simulatorDisconnected", { identity: this.chargePointIdentity });
    this.clear();
  }
}
