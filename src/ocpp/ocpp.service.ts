import { randomUUID } from "node:crypto";

import { 
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
import { logger } from "../logger";
import { simulatorsRegistry } from "../registry";
import { OcppValidator } from "./ocpp.validator";

export class OcppService {
  private readonly identity: string;
  private readonly ocppValidator = new OcppValidator();

  constructor (options: OcppServiceOptions) {
    this.identity = options.identity;
  }

  private callMessage<P>(action: OcppMessageAction, payload: P): CallMessage<P> {
    return [OcppMessageType.CALL, randomUUID(), action, payload];
  }

  private callResultMessage<P>(messageId: string, payload: P): CallResultMessage<P> {
    return [OcppMessageType.RESULT, messageId, payload];
  }

  private callErrorMessage(messageId: string, errorCode: OcppErrorCode, description: string = "", details: Record<string, unknown> = {}): CallErrorMessage {
    return [OcppMessageType.ERROR, messageId, errorCode, description, JSON.stringify(details)];
  }

  private handleCallMessage(message: CallMessage<unknown>): CallResultMessage<unknown> | CallErrorMessage | undefined {
    const isValidCallMessage = this.ocppValidator.validateOcppCallMessage(message);

    if (!isValidCallMessage) {
      logger.error("Invalid OCPP call message received", { message });
      return;
    }

    const [, messageId, action, payload] = message;
    const isTransactionRequest = [OcppMessageAction.REMOTE_STOP_TRANSACTION, OcppMessageAction.REMOTE_START_TRANSACTION].includes(action);
    const simulatorState = simulatorsRegistry.getSimulator(this.identity);

    if (isTransactionRequest && simulatorState.registrationStatus === RegistrationStatus.PENDING) {
      logger.error("Can not proceed transaction request while CS being rejected by Central System");
      return;
    }

    if (simulatorState.registrationStatus === RegistrationStatus.REJECTED) {
      logger.error("While Rejected, the Charge Point SHALL NOT respond to any Central System initiated message");
      return;
    }

    const { isValid, errorCode } = this.ocppValidator.validateOcppRequestPayload(action, payload);

    if (!isValid) {
      const errorMessage = this.callErrorMessage(messageId, errorCode);
      logger.error("Error during validation of OCPP call message payload", { errorMessage });
      return errorMessage;
    }

    switch (action) {
    default:
      const errorMessage = this.callErrorMessage(messageId, OcppErrorCode.NOT_IMPLEMENTED);
      logger.error("Not supported OCPP message ", { message });
      return errorMessage;
    }
  }

  private handleCallResultMessage(message: CallResultMessage<unknown>): void {}
  private handleCallErrorMessage(message: CallErrorMessage): void {}

  public handleMessage(message: OcppMessage<unknown>): CallResultMessage<unknown> | CallErrorMessage | undefined {
    const [messageType] = message;
    const isValidOcppMessage = Array.isArray(message) && [2, 3, 4].includes(messageType);
    const simulatorState = simulatorsRegistry.getSimulator(this.identity);

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
}
