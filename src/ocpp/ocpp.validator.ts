import { ClassConstructor } from "class-transformer";

import { 
  mapErrorConstraintToErrorCode, 
  validateDto 
} from "../utils";
import { 
  BootNotificationConfSchema, 
  ChangeConfigurationReqSchema, 
  GetConfigurationReqSchema, 
  HeartbeatConfSchema
} from "./schemas";
import { 
  OcppErrorCode, 
  OcppMessage, 
  OcppMessageAction, 
  OcppMessageType
} from "./types";

export class OcppValidator {
  private readonly ocppResponsesValidators = {
    [OcppMessageAction.BOOT_NOTIFICATION]: BootNotificationConfSchema,
    [OcppMessageAction.HEARTBEAT]: HeartbeatConfSchema,
  };
  
  private readonly ocppRequestsValidators = {
    [OcppMessageAction.GET_CONFIGURATION]: GetConfigurationReqSchema,
    [OcppMessageAction.CHANGE_CONFIGURATION]: ChangeConfigurationReqSchema,
  };

  public validateOcppCallMessage(message: OcppMessage<unknown>): boolean {
    return message?.[0] === OcppMessageType.CALL && message.length === 4;
  }

  public validateOcppPayload<P>(payload: P, validator: ClassConstructor<any>): { isValid: boolean, errorCode?: OcppErrorCode } {
    const { isValid, errors } = validateDto(payload, validator);
    return { isValid, errorCode: !isValid ? mapErrorConstraintToErrorCode(errors[0].constraint) : undefined };
  }

  public validateOcppRequestPayload<P>(action: OcppMessageAction, payload: P): { isValid: boolean, errorCode?: OcppErrorCode } {
    if (!this.ocppRequestsValidators[action]) {
      return { 
        isValid: false, 
        errorCode: OcppErrorCode.NOT_IMPLEMENTED 
      };
    }

    return this.validateOcppPayload(payload, this.ocppRequestsValidators[action]);
  }

  public validateOcppResponsePayload<P>(action: OcppMessageAction, payload: P): { isValid: boolean, errorCode?: OcppErrorCode } {
    if (!this.ocppResponsesValidators[action]) {
      return { 
        isValid: false, 
        errorCode: OcppErrorCode.NOT_IMPLEMENTED 
      };
    }

    return this.validateOcppPayload(payload, this.ocppResponsesValidators[action]);
  }
}
