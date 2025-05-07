import WebSocket from "ws";

import { logger } from "../logger";
import { ConnectOptions } from "./types";

export class WebSocketService {
  private wsClient: WebSocket;
  private isConnected = false;
  private pingInterval: NodeJS.Timeout;
  private webSocketPingInterval: number;

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.wsClient.ping();
    }, this.webSocketPingInterval * 1000);
  }

  private onOpen(): void {
    logger.info("WebSocket connection is opened");
    this.isConnected = true;
    this.startPingInterval();
  }

  private onPing(): void {
    this.wsClient.pong();
  }

  private onClose(): void {
    logger.warn("WebSocket connection is closed");
  } 

  private onError(error: Error): void {
    logger.error("WS error occured", { error });
  }

  private onMessage(data: WebSocket.RawData): void {
    const message = data.toString();
    logger.info("WebSocket message received", { message });
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public connect(options: ConnectOptions): void {
    this.webSocketPingInterval = options.webSocketPingInterval;
    this.wsClient = new WebSocket(`${options.cpmsUrl}/${options.chargePointIdentity}`, "ocpp1.6");

    this.wsClient.on("open", this.onOpen.bind(this));
    this.wsClient.on("ping", this.onPing.bind(this));
    this.wsClient.on("close", this.onClose.bind(this));
    this.wsClient.on("error", this.onError.bind(this));
    this.wsClient.on("message", this.onMessage.bind(this));
  }

  public disconnect(): void {
    this.wsClient.close();
    this.isConnected = false;
    this.wsClient = null;
    this.webSocketPingInterval = null;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
