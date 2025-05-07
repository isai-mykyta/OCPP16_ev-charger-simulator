import WebSocket from "ws";

import { logger } from "../logger";

export class WebSocketClient {
  private wsClient: WebSocket;
  private isConnected = false;

  private onOpen(): void {
    logger.info("WebSocket connection is opened");
    this.isConnected = true;
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

  public connect(cpmsUrl: string, chargePointIdentity: string): void {
    this.wsClient = new WebSocket(`${cpmsUrl}/${chargePointIdentity}`, "ocpp1.6");

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
  }
}
