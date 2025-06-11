import { 
  AuthorizeConf,
  BootNotificationConf,
  CallErrorMessage, 
  CallMessage, 
  CallResultMessage, 
  ChangeConfigurationReq, 
  OcppErrorCode, 
  OcppMessage, 
  OcppMessageAction, 
  OcppMessageType,
  RegistrationStatus,
} from "./types";
import { logger } from "../logger";
import { OcppValidator } from "./ocpp.validator";
import { Simulator } from "../simulator";
import { callErrorMessage, callResultMessage } from "../utils";
import { 
  handleBootNotificationResponse,
  handleChangeConfigurationRequest,
  handleGetConfigurationRequest,
  handleAuthorizeResponse
} from "./handlers";

export class OcppHandlerService {
  private readonly ocppValidator = new OcppValidator();
  private readonly simulator: Simulator;

  constructor (simulator: Simulator) {
    this.simulator = simulator;
  }

  private handleCallMessage(message: CallMessage<unknown>): CallResultMessage<unknown> | CallErrorMessage {
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
      return errorMessage;
    }

    switch (action) {
    case OcppMessageAction.GET_CONFIGURATION: {
      const responsePayload = handleGetConfigurationRequest(this.simulator, payload);
      return callResultMessage(messageId, responsePayload);
    }
    case OcppMessageAction.CHANGE_CONFIGURATION: {
      const responsePayload = handleChangeConfigurationRequest(this.simulator, payload as ChangeConfigurationReq);
      return callResultMessage(messageId, responsePayload);
    }
    default:
      const errorMessage = callErrorMessage(messageId, OcppErrorCode.NOT_IMPLEMENTED);
      logger.error("Not supported OCPP message ", { message });
      return errorMessage;
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
    case OcppMessageAction.AUTHORIZE:
      handleAuthorizeResponse(this.simulator, payload as AuthorizeConf);
      break;
    default:
      break;
    }

    this.simulator.ocppResponse$.next(message);
  }

  private handleCallErrorMessage(message: CallErrorMessage): void {
    logger.error("Call error message received", { message });
  }

  public handleMessage(message: OcppMessage<unknown>): CallResultMessage<unknown> | CallErrorMessage | undefined {
    const [messageType] = message;
    const isValidOcppMessage = Array.isArray(message) && [2, 3, 4].includes(messageType);

    if (!isValidOcppMessage) {
      logger.error("Invalid OCPP message received", { message });
      return;
    }

    logger.info("OCPP message received", { message });

    if (this.simulator.registrationStatus === RegistrationStatus.REJECTED) {
      logger.error("While Rejected, the Charge Point SHALL NOT respond to any Central System initiated message");
      return;
    }

    switch (messageType) {
    case OcppMessageType.CALL:
      return this.handleCallMessage(message);
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
}
