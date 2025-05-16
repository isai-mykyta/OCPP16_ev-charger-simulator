import { Simulator } from "../../simulator";
import { BootNotificationConf } from "../types";

export const handleBootNotificationResponse = (
  simulator: Simulator, 
  response: BootNotificationConf
): void => {
  simulator.heartbeatInterval = response.interval;
  simulator.registrationStatus = response.status;
};
