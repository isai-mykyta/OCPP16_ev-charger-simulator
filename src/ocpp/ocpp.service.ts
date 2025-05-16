import { 
  BootNotificationReq,
  CallErrorMessage, 
  CallMessage, 
  CallResultMessage, 
  OcppErrorCode, 
  OcppMessage, 
  OcppMessageAction, 
  OcppMessageType, 
  OcppServiceOptions,
  RegistrationStatus
} from "./types";
import { eventsService } from "../events/events.service";
import { logger } from "../logger";
import { ocppRegistry } from "../ocpp-registry";
import { simulatorsRegistry, SimulatorState } from "../simulator-registry";
import { OcppValidator } from "./ocpp.validator";
import { callErrorMessage, callMessage } from "../utils";

export class OcppService {
  private readonly ocppValidator = new OcppValidator();
  private readonly simulator: SimulatorState;

  constructor (options: OcppServiceOptions) {
    this.simulator = simulatorsRegistry.getSimulator(options.identity);
  }

  private handleCallMessage(message: CallMessage<unknown>): CallResultMessage<unknown> | CallErrorMessage | undefined {
    const isValidCallMessage = this.ocppValidator.validateOcppCallMessage(message);

    if (!isValidCallMessage) {
      logger.error("Invalid OCPP call message received", { message });
      return;
    }

    const [, messageId, action, payload] = message;
    const isTransactionRequest = [OcppMessageAction.REMOTE_STOP_TRANSACTION, OcppMessageAction.REMOTE_START_TRANSACTION].includes(action);
    const simulatorState = simulatorsRegistry.getSimulator(this.simulator.identity);

    if (isTransactionRequest && simulatorState.registrationStatus === RegistrationStatus.PENDING) {
      logger.error("Can not proceed transaction request while CS being rejected by Central System");
      return;
    }

    const { isValid, errorCode } = this.ocppValidator.validateOcppRequestPayload(action, payload);

    if (!isValid) {
      const errorMessage = callErrorMessage(messageId, errorCode);
      logger.error("Error during validation of OCPP call message payload", { errorMessage });
      return errorMessage;
    }

    switch (action) {
    default:
      const errorMessage = callErrorMessage(messageId, OcppErrorCode.NOT_IMPLEMENTED);
      logger.error("Not supported OCPP message ", { message });
      return errorMessage;
    }
  }

  private handleCallResultMessage(message: CallResultMessage<unknown>): void {
    const [, messageId, payload] = message;
    const pendingRequest = ocppRegistry.getMessage(messageId);

    if (!pendingRequest) {
      logger.error("Failed to find pending request for received message", { message });
      return;
    }

    const [,, action] = pendingRequest;
    eventsService.emit("ocppResponseReceived", { message });
    const isResponsePayloadValid = this.ocppValidator.validateOcppResponsePayload(action, payload);

    if (!isResponsePayloadValid) {
      logger.error("Recieved invlid OCPP response message", { message });
      return;
    }

    switch (action) {
    default:
      break;
    }
  }

  private handleCallErrorMessage(message: CallErrorMessage): void {
    logger.error("Call error message received", { message });
  }

  public handleMessage(message: OcppMessage<unknown>): CallResultMessage<unknown> | CallErrorMessage | undefined {
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
      const result = this.handleCallMessage(message);
      return result;
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

  public bootNotificationReq(): CallMessage<BootNotificationReq> {
    const imsi = this.simulator.configuration.findConfigByKey("imsi");
    const iccid = this.simulator.configuration.findConfigByKey("iccid");
    const meterType = this.simulator.configuration.findConfigByKey("meterType");
    const firmwareVersion = this.simulator.configuration.findConfigByKey("firmwareVersion");
    const chargePointSerialNumber = this.simulator.configuration.findConfigByKey("chargePointSerialNumber");
    const meterSerialNumber = this.simulator.configuration.findConfigByKey("meterSerialNumber");
    const chargeBoxSerialNumber = this.simulator.configuration.findConfigByKey("chargeBoxSerialNumber");

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
