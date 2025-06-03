import { filter, map, Subject, tap } from "rxjs";

import { 
  BootNotificationConf,
  BootNotificationReq,
  CallErrorMessage, 
  CallMessage, 
  CallResultMessage, 
  ChangeConfigurationReq, 
  OcppErrorCode, 
  OcppMessage, 
  OcppMessageAction, 
  OcppMessageType,
  RegistrationStatus,
  StatusNotificationReq
} from "./types";
import { logger } from "../logger";
import { OcppValidator } from "./ocpp.validator";
import { Simulator } from "../simulator";
import { 
  callErrorMessage, 
  callMessage, 
  callResultMessage 
} from "../utils";
import { 
  handleBootNotificationResponse,
  handleChangeConfigurationRequest,
  handleGetConfigurationRequest
} from "./handlers";

export class OcppService {
  private readonly ocppValidator = new OcppValidator();
  private readonly simulator: Simulator;
  
  private readonly _ocppResponse$ = new Subject<OcppMessage<unknown>>();
  public readonly ocppResponse$ = this._ocppResponse$.asObservable();

  private readonly _ocppRequest$ = new Subject<CallMessage<unknown>>();
  public readonly ocppRequest$ = this._ocppRequest$.asObservable();

  constructor (simulator: Simulator) {
    this.simulator = simulator;

    this.simulator.ocppRequest$.pipe(
      map(({ action, payload }) => this.getOcppRequest(action, payload)),
      filter((req): req is CallMessage<object> => req !== null),
      tap((req) => this._ocppRequest$.next(req))
    ).subscribe();   
  }

  private getOcppRequest<P>(action: OcppMessageAction, payload?: P): CallMessage<unknown> {
    switch (action) {
    case OcppMessageAction.BOOT_NOTIFICATION:
      return this.bootNotificationReq();
    case OcppMessageAction.HEARTBEAT:
      return this.hearbeatReq();
    case OcppMessageAction.STATUS_NOTIFICATION:
      return this.statusNotificationReq(payload as StatusNotificationReq);
    default:
      return null;
    }
  }

  private handleCallMessage(message: CallMessage<unknown>): CallResultMessage<unknown> | CallErrorMessage | undefined {
    const isValidCallMessage = this.ocppValidator.validateOcppCallMessage(message);

    if (!isValidCallMessage) {
      logger.error("Invalid OCPP call message received", { message });
      return;
    }

    const [, messageId, action, payload] = message;
    const isTransactionRequest = [OcppMessageAction.REMOTE_STOP_TRANSACTION, OcppMessageAction.REMOTE_START_TRANSACTION].includes(action);

    if (isTransactionRequest && this.simulator.registrationStatus === RegistrationStatus.PENDING) {
      logger.error("Can not proceed transaction request while CS being rejected by Central System");
      return;
    }

    const { isValid, errorCode } = this.ocppValidator.validateOcppRequestPayload(action, payload);

    if (!isValid) {
      const errorMessage = callErrorMessage(messageId, errorCode);
      logger.error("Error during validation of OCPP call message payload", { errorMessage });
      this._ocppResponse$.next(errorMessage);
      return;
    }

    switch (action) {
    case OcppMessageAction.GET_CONFIGURATION: {
      const responsePayload = handleGetConfigurationRequest(this.simulator, payload);
      this._ocppResponse$.next(callResultMessage(messageId, responsePayload));
      return;
    }
    case OcppMessageAction.CHANGE_CONFIGURATION: {
      const responsePayload = handleChangeConfigurationRequest(this.simulator, payload as ChangeConfigurationReq);
      this._ocppResponse$.next(callResultMessage(messageId, responsePayload));
      return;
    }
    default:
      const errorMessage = callErrorMessage(messageId, OcppErrorCode.NOT_IMPLEMENTED);
      this._ocppResponse$.next(errorMessage);
      logger.error("Not supported OCPP message ", { message });
      return;
    }
  }

  private handleCallResultMessage(message: CallResultMessage<unknown>): void {
    const [, messageId, payload] = message;
    const pendingRequest = this.simulator.getPendingRequest(messageId);

    if (!pendingRequest) {
      logger.error("Failed to find pending request for received message", { message });
      return;
    }

    const [,, action] = pendingRequest;
    this.simulator.clearPendingRequest(messageId);
    const { isValid } = this.ocppValidator.validateOcppResponsePayload(action, payload);

    if (!isValid) {
      logger.error("Recieved invalid OCPP response message", { message: JSON.stringify(message) });
      return;
    }

    switch (action) {
    case OcppMessageAction.BOOT_NOTIFICATION:
      handleBootNotificationResponse(this.simulator, payload as BootNotificationConf);
      break;
    case OcppMessageAction.HEARTBEAT:
      break;
    case OcppMessageAction.STATUS_NOTIFICATION:
      break;
    default:
      break;
    }
  }

  private handleCallErrorMessage(message: CallErrorMessage): void {
    logger.error("Call error message received", { message });
  }

  public handleMessage(message: OcppMessage<unknown>): void {
    const [messageType] = message;
    const isValidOcppMessage = Array.isArray(message) && [2, 3, 4].includes(messageType);

    if (!isValidOcppMessage) {
      logger.error("Invalid OCPP message received", { message });
      return;
    }

    if (this.simulator.registrationStatus === RegistrationStatus.REJECTED) {
      logger.error("While Rejected, the Charge Point SHALL NOT respond to any Central System initiated message");
      return;
    }

    switch (messageType) {
    case OcppMessageType.CALL:
      this.handleCallMessage(message);
      break;
    case OcppMessageType.RESULT:
      this.handleCallResultMessage(message);
      break;
    case OcppMessageType.ERROR:
      this.handleCallErrorMessage(message);
      break;
    default:
      break;
    }
  }

  public hearbeatReq(): CallMessage<object> {
    return callMessage(OcppMessageAction.HEARTBEAT, {});
  }

  public statusNotificationReq(payload: StatusNotificationReq): CallMessage<StatusNotificationReq> {
    return callMessage(OcppMessageAction.STATUS_NOTIFICATION, payload);
  }

  public bootNotificationReq(): CallMessage<BootNotificationReq> {
    const imsi = this.simulator.configuration.find((v) => v.key === "Imsi");
    const iccid = this.simulator.configuration.find((v) => v.key === "Iccid");
    const meterType = this.simulator.configuration.find((v) => v.key === "MeterType");
    const firmwareVersion = this.simulator.configuration.find((v) => v.key === "FirmwareVersion");
    const meterSerialNumber = this.simulator.configuration.find((v) => v.key === "MeterSerialNumber");
    const chargeBoxSerialNumber = this.simulator.configuration.find((v) => v.key === "ChargeBoxSerialNumber");

    const payload: BootNotificationReq = {
      chargePointModel: this.simulator.model,
      chargePointVendor: this.simulator.vendor,
      chargePointSerialNumber: this.simulator.chargePointSerialNumber,
      ...(imsi && { imsi: imsi.value }),
      ...(iccid && { iccid: iccid.value }),
      ...(meterType && { meterType: meterType.value }),
      ...(firmwareVersion && { firmwareVersion: firmwareVersion.value }),
      ...(meterSerialNumber && { meterSerialNumber: meterSerialNumber.value }),
      ...(chargeBoxSerialNumber && { chargeBoxSerialNumber: chargeBoxSerialNumber.value }),
    };

    return callMessage(OcppMessageAction.BOOT_NOTIFICATION, payload);
  }
}
