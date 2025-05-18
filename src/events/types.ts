import { StatusNotificationReq } from "../ocpp";

export type Events = {
  triggerBootNotification: { identity: string },
  triggerHeartbeat: { identity: string },
  triggerStatusNotification: { identity: string, payload: StatusNotificationReq }
}
