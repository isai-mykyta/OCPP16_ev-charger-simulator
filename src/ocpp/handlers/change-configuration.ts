import { Simulator } from "../../simulator";
import { isBoolString, isPositiveIntegerString } from "../../utils/validators";
import { ChangeConfigurationConf, ChangeConfigurationReq, ConfigurationStatus } from "../types";

const validators: Record<string, (v: string) => boolean> = {
  "HeartbeatInterval": (v: string) => isPositiveIntegerString(v),
  "WebSocketPingInterval": (v: string) => isPositiveIntegerString(v),
  "GetConfigurationMaxKeys": (v: string) => isPositiveIntegerString(v),
  "AllowOfflineTxForUnknownId": (v: string) => isBoolString(v),
  "AuthorizationCacheEnabled": (v: string) => isBoolString(v),
  "AuthorizeRemoteTxRequests": (v: string) => isBoolString(v),
  "ConnectionTimeOut": (v: string) => isPositiveIntegerString(v),
  "LocalAuthorizeOffline": (v: string) => isBoolString(v),
  "LocalPreAuthorize": (v: string) => isBoolString(v),
  "MaxEnergyOnInvalidId": (v: string) => isPositiveIntegerString(v),
  "StopTransactionOnEVSideDisconnect": (v: string) => isBoolString(v),
  "StopTransactionOnInvalidId": (v: string) => isBoolString(v),
  "TransactionMessageAttempts": (v: string) => isPositiveIntegerString(v),
  "TransactionMessageRetryInterval": (v: string) => isPositiveIntegerString(v),
  "UnlockConnectorOnEVSideDisconnect": (v: string) => isBoolString(v),
  "WebSocketUser": (_: string) => true,
  "WebSocketPassword": (_: string) => true,
  "HycKioskModeEnabled": (v: string) => isBoolString(v),
  "RemoteTxStoppableLocally": (v: string) => isBoolString(v),
  "KioskModeWhenOffline": (v: string) => isBoolString(v),
  "SendOcppSecurityNotifications": (v: string) => isBoolString(v),
};

// TODO: complete Reboot flow and add per key validation
export const handleChangeConfigurationRequest = (
  simulator: Simulator, 
  request: ChangeConfigurationReq
): ChangeConfigurationConf => {
  const config = simulator.configuration.find((config) => config.key === request.key);
  
  if (!config) {
    return { status: ConfigurationStatus.NOT_SUPPORTED };
  }

  if (config.readonly) {
    return { status: ConfigurationStatus.REJECTED };
  }

  const validator = validators[config.key];

  if (!!validator && validator(request.value)) {
    config.value = request.value;
    return { status: ConfigurationStatus.ACCEPTED };
  }

  return { status: ConfigurationStatus.REJECTED };
};
