import { Simulator } from "../../simulator";
import { ChangeConfigurationConf, ChangeConfigurationReq, ConfigurationStatus } from "../types";

// TODO: complete Reboot flow and add per key validation
export const handleChangeConfigurationRequest = (
  simulator: Simulator, 
  request: ChangeConfigurationReq
): ChangeConfigurationConf => {
  const config = simulator.configuration.find((config) => config.key === request.key);
  
  if (!config) {
    return {status: ConfigurationStatus.NOT_SUPPORTED };
  }

  if (config.readonly) {
    return {status: ConfigurationStatus.REJECTED };
  }

  config.value = request.value;
  return { status: ConfigurationStatus.ACCEPTED };
};
