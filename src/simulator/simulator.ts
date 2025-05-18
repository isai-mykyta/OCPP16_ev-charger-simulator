import { SimulatorOptions } from "./types";
import { Connector } from "../connector";
import { eventsService } from "../events";
import { 
  CallMessage, 
  ChargePointErrorCode, 
  ChargePointStatus, 
  KeyValue, 
  RegistrationStatus 
} from "../ocpp";
import { WebSocketService } from "../websocket/websocket.service";

export abstract class Simulator {
  public readonly webSocketUrl: string;
  public readonly identity: string;
  public readonly model: string;
  public readonly vendor: string;
  public readonly configuration: KeyValue[];

  private _isOnline: boolean;
  private _registrationStatus: RegistrationStatus;
  
  private heartbeatTimer: NodeJS.Timeout;
  
  private readonly pendingRequests = new Map<string, CallMessage<unknown>>();
  private readonly connectors = new Map<number, Connector>();
  private readonly wsService: WebSocketService;

  constructor (options: SimulatorOptions) {
    this.webSocketUrl = options.webSocketUrl;
    this.identity = options.chargePointIdentity;
    this.model = options.model;
    this.vendor = options.vendor;
    this.configuration = options.configuration;

    this._isOnline = false;

    this.wsService = new WebSocketService();

    options.connectors.forEach((connector, idx) => {
      this.connectors.set(idx + 1, new Connector({
        id: idx + 1,
        type: connector.type,
      }));
    });
  }

  private handleRejectedRegistrationStatus(): void {
    setTimeout(() => {
      eventsService.emit("triggerBootNotification", { identity: this.identity });
    }, this.heartbeatInterval * 1000);
  }

  private handleAcceptedRegistrationStatus(): void {
    this.heartbeatTimer = setInterval(() => {
      eventsService.emit("triggerHeartbeat", { identity: this.identity });
    }, this.heartbeatInterval * 1000);

    eventsService.emit("triggerStatusNotification", { 
      identity: this.identity,
      payload: {
        connectorId: 0,
        status: ChargePointStatus.AVAILABLE,
        errorCode: ChargePointErrorCode.NO_ERROR
      }
    });

    this.connectors.forEach((connector) => {
      eventsService.emit("triggerStatusNotification", { 
        identity: this.identity,
        payload: {
          connectorId: connector.id,
          status: ChargePointStatus.AVAILABLE,
          errorCode: ChargePointErrorCode.NO_ERROR
        }
      });
    });
  }

  private setConfigKey(key: string, value: string, readonly: boolean): void {
    const configKey = this.configuration.find((config) => config.key === key);
    configKey ? configKey.value = value : this.configuration.push({ key, readonly, value });
  }

  public start(): void {
    this.wsService.connect({
      identity: this.identity,
      webSocketPingInterval: this.webSocketPingInterval,
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

    switch (status) {
    case RegistrationStatus.REJECTED:
      this.handleRejectedRegistrationStatus();
      break;
    case RegistrationStatus.ACCEPTED:
      this.handleAcceptedRegistrationStatus();
      break;
    default:
      break;
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
    this.setConfigKey("HeartbeatInterval", value.toString(), false);
  }

  public get heartbeatInterval(): number {
    return Number(this.configuration.find((config) => config.key === "HeartbeatInterval")?.value || 120);
  }

  public get webSocketPingInterval(): number {
    return Number(this.configuration.find((config) => config.key === "WebSocketPingInterval")?.value || 60);
  }

  public set webSocketPingInterval(value: number) {
    if (value < 10) return;
    this.setConfigKey("WebSocketPingInterval", value.toString(), false);
  }
}
