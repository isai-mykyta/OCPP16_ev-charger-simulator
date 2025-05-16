import { Simulator } from "../../simulator";
import { GetConfigurationConf, GetConfigurationReq } from "../types";

export const handleGetConfigurationRequest = (
  simulator: Simulator, 
  request: GetConfigurationReq
): GetConfigurationConf => {
  const configKeysLimit = Number(simulator.configuration.find((config) => config.key === "GetConfigurationMaxKeys")?.value || 1000);

  if (!request.key) {
    return {
      configurationKey: simulator.configuration.slice(0, configKeysLimit)
    };
  }

  const unknownKey = [];
  const configurationKey = [];

  request.key.forEach((key) => {
    const foundKey = simulator.configuration.find((config) => config.key === key);
    foundKey ? configurationKey.push(foundKey) : unknownKey.push(key);
  });

  return {
    ...(unknownKey.length && { unknownKey }),
    configurationKey: configurationKey.slice(0, configKeysLimit)
  };
};
