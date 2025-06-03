import { ChargePointErrorCode, ChargePointStatus } from "../ocpp";
import { ConnectorOptions, ConnectorType } from "./types";

export class Connector {
  public readonly id: number;
  public readonly type: ConnectorType;
  public readonly maxCurrent: number;

  private _status: ChargePointStatus;
  private _errorCode: ChargePointErrorCode;
  private _enabled: boolean;
  private _reserved: boolean;

  constructor (options: ConnectorOptions) {
    this.id = options.id;
    this.type = options.type;
    this.maxCurrent = options.maxCurrent;

    this._status = ChargePointStatus.AVAILABLE;
    this._errorCode = ChargePointErrorCode.NO_ERROR;
    
    this._enabled = true;
    this._reserved = false;
  }

  public get status(): ChargePointStatus {
    return this._status;
  }

  public get errorCode(): ChargePointErrorCode {
    return this._errorCode;
  }

  public get isEnabled(): boolean {
    return this._enabled;
  }

  public get isReserved(): boolean {
    return this._reserved;
  }

  public set status(value: ChargePointStatus) {
    this._status = value;
  }

  public set errorCode(value: ChargePointErrorCode) {
    this._errorCode = value;
  }

  public set isEnabled(value: boolean) {
    this._enabled = value;
  }

  public set isReserved(value: boolean) {
    this._reserved = value;
  }
}
