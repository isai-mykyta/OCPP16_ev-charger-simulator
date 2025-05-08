import { randomUUID } from "node:crypto";

import { 
  CallErrorMessage, 
  CallMessage, 
  CallResultMessage, 
  OcppErrorCode, 
  OcppMessageAction, 
  OcppMessageType 
} from "./types";

export class OcppService {
  private callMessage<P>(action: OcppMessageAction, payload: P): CallMessage<P> {
    return [OcppMessageType.CALL, randomUUID(), action, payload];
  }

  private callResultMessage<P>(messageId: string, payload: P): CallResultMessage<P> {
    return [OcppMessageType.RESULT, messageId, payload];
  }

  private callErrorMessage(messageId: string, errorCode: OcppErrorCode, description: string = "", details: Record<string, unknown> = {}): CallErrorMessage {
    return [OcppMessageType.ERROR, messageId, errorCode, description, JSON.stringify(details)];
  }
}
