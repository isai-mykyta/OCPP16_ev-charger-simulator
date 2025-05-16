import { SimulatorOptions } from "./types";
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

  private readonly pendingRequests = new Map<string, CallMessage<unknown>>();
  private readonly wsService: WebSocketService;

  constructor (options: SimulatorOptions) {
    this.webSocketUrl = options.webSocketUrl;
    this.identity = options.chargePointIdentity;
    this.model = options.model;
    this.vendor = options.vendor;
    this.configuration = options.configuration;
    this._isOnline = false;

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
}
