import { Subject } from "rxjs";

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
import { simulatorsRegistry } from "../registry";
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

  constructor (simulator: Simulator) {
    this.simulator = simulator;
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
    const simulatorState = simulatorsRegistry.getSimulator(this.simulator.identity);

    if (!isValidOcppMessage) {
      logger.error("Invalid OCPP message received", { message });
      return;
    }

    if (simulatorState?.registrationStatus === RegistrationStatus.REJECTED) {
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
    const imsi = this.simulator.configuration.find((v) => v.key === "imsi");
    const iccid = this.simulator.configuration.find((v) => v.key === "iccid");
    const meterType = this.simulator.configuration.find((v) => v.key === "meterType");
    const firmwareVersion = this.simulator.configuration.find((v) => v.key === "firmwareVersion");
    const chargePointSerialNumber = this.simulator.configuration.find((v) => v.key === "chargePointSerialNumber");
    const meterSerialNumber = this.simulator.configuration.find((v) => v.key === "meterSerialNumber");
    const chargeBoxSerialNumber = this.simulator.configuration.find((v) => v.key === "chargeBoxSerialNumber");

    const payload: BootNotificationReq = {
      chargePointModel: this.simulator.model,
      chargePointVendor: this.simulator.vendor,
      ...(imsi && { imsi: imsi.value }),
      ...(iccid && { iccid: iccid.value }),
      ...(meterType && { meterType: meterType.value }),
      ...(firmwareVersion && { firmwareVersion: firmwareVersion.value }),
      ...(chargePointSerialNumber && { chargePointSerialNumber: chargePointSerialNumber.value }),
      ...(meterSerialNumber && { meterSerialNumber: meterSerialNumber.value }),
      ...(chargeBoxSerialNumber && { chargeBoxSerialNumber: chargeBoxSerialNumber.value }),
    };

    return callMessage(OcppMessageAction.BOOT_NOTIFICATION, payload);
  }
}
