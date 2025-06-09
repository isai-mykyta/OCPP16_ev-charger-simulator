import { callMessage } from "../utils";
import { 
  AuthorizeReq,
  BootNotificationReq,
  CallMessage, 
  OcppMessageAction, 
  StatusNotificationReq 
} from "./types";

export class OcppDispatchService {
  public hearbeatReq(): CallMessage<object> {
    return callMessage(OcppMessageAction.HEARTBEAT, {});
  }

  public statusNotificationReq(payload: StatusNotificationReq): CallMessage<StatusNotificationReq> {
    return callMessage(OcppMessageAction.STATUS_NOTIFICATION, payload);
  }

  public bootNotificationReq(payload: BootNotificationReq): CallMessage<BootNotificationReq> {
    return callMessage(OcppMessageAction.BOOT_NOTIFICATION, payload);
  }

  public authorizeReq(payload: AuthorizeReq): CallMessage<AuthorizeReq> {
    return callMessage(OcppMessageAction.AUTHORIZE, payload);
  }
}
