import { SimulatorOptions } from "./types";
import { eventsService } from "../events";
import { CallMessage, KeyValue, RegistrationStatus } from "../ocpp";
import { WebSocketService } from "../websocket/websocket.service";

export abstract class Simulator {
  public readonly webSocketUrl: string;
  public readonly identity: string;
  public readonly model: string;
  public readonly vendor: string;
  public readonly configuration: KeyValue[];

  private _isOnline: boolean;
  private _registrationStatus: RegistrationStatus;
  private _heartbeatInterval: number;
  
  private heartbeatTimer: NodeJS.Timeout;
  
  private readonly pendingRequests = new Map<string, CallMessage<unknown>>();
  private readonly wsService: WebSocketService;

  constructor (options: SimulatorOptions) {
    this.webSocketUrl = options.webSocketUrl;
    this.identity = options.chargePointIdentity;
    this.model = options.model;
    this.vendor = options.vendor;
    this.configuration = options.configuration;

    this._isOnline = false;
    this._heartbeatInterval = 60;

    this.wsService = new WebSocketService();
  }

  public start(): void {
    this.wsService.connect({
      identity: this.identity,
      webSocketPingInterval: 60,
      webSocketUrl: this.webSocketUrl
    });
  }

  public stop(): void {
    this.wsService.disconnect();
    this.registrationStatus = null;

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public storePendingRequest(request: CallMessage<unknown>): void {
    this.pendingRequests.set(request[1], request);
  }

  public clearPendingRequest(requestId: string): void {
    this.pendingRequests.delete(requestId);
  }

  public getPendingRequest(requestId: string): CallMessage<unknown> {
    return this.pendingRequests.get(requestId);
  }

  public clearPendingRequests(): void {
    this.pendingRequests.clear();
  }

  public set registrationStatus(status: RegistrationStatus) {
    this._registrationStatus = status;

    if (status === RegistrationStatus.REJECTED) {
      setTimeout(() => {
        eventsService.emit("triggerBootNotification", { identity: this.identity });
      }, this.heartbeatInterval * 1000);
    } else if (status === RegistrationStatus.ACCEPTED) {
      this.heartbeatTimer = setInterval(() => {
        eventsService.emit("triggerHeartbeat", { identity: this.identity });
      }, this.heartbeatInterval * 1000);
    }
  }

  public get registrationStatus(): RegistrationStatus {
    return this._registrationStatus;
  }

  public set isOnline(value: boolean) {
    this._isOnline = value;
  }

  public get isOnline(): boolean {
    return this._isOnline;
  }

  public set heartbeatInterval(value: number) {
    if (value < 10) return;
    this._heartbeatInterval = value;

    const configKey = this.configuration.find((config) => config.key === "HeartbeatInterval");
    if (configKey) configKey.value = value.toString();
  }

  public get heartbeatInterval(): number {
    return this._heartbeatInterval;
  }
}
