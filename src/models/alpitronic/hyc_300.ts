import { ConnectorType } from "../../connector";
import { Simulator, SimulatorOptions } from "../../simulator";
import { ALPITRONIC_MODELS, VENDORS } from "../../utils";

const configuration = [
  {
    key: "HeartbeatInterval",
    readonly: false,
    value: "86400"
  },
  {
    key: "WebSocketPingInterval",
    readonly: false,
    value: "60"
  },
  {
    key: "GetConfigurationMaxKeys",
    readonly: false,
    value: "100"
  },
  {
    key: "NumberOfConnectors",
    readonly: true,
    value: "2"
  },
  {
    key: "SupportedFeatureProfiles",
    readonly: true,
    value: "Core,FirmwareManagement,LocalAuthListManagement,Reservation,SmartCharging,RemoteTrigger"
  },
  {
    readonly: false,
    key: "AllowOfflineTxForUnknownId",
    value: "false",
  },
  {
    readonly: false,
    key: "AuthorizationCacheEnabled",
    value: "true",
  },
  {
    readonly: false,
    key: "AuthorizeRemoteTxRequests",
    value: "true",
  },
  {
    readonly: false,
    key: "ConnectionTimeOut",
    value: "60",
  },
  {
    readonly: false,
    key: "LocalAuthorizeOffline",
    value: "true",
  },
  {
    readonly: false,
    key: "LocalPreAuthorize",
    value: "false",
  },
  {
    readonly: false,
    key: "MaxEnergyOnInvalidId",
    value: "100",
  },
  {
    readonly: true,
    key: "MeterValuesAlignedData",
    value: "Energy.Active.Import.Register",
  },
  {
    readonly: true,
    key: "MeterValuesAlignedDataMaxLength",
    value: "6",
  },
  {
    readonly: true,
    key: "MeterValuesSampledData",
    value: "Energy.Active.Import.Register",
  },
  {
    readonly: true,
    key: "MeterValuesSampledDataMaxLength",
    value: "6",
  },
  {
    readonly: true,
    key: "MeterValueSampleInterval",
    value: "1",
  },
  {
    readonly: true,
    key: "ConnectorPhaseRotation",
    value: "0.RST,",
  },
  {
    readonly: false,
    key: "StopTransactionOnEVSideDisconnect",
    value: "true",
  },
  {
    readonly: false,
    key: "StopTransactionOnInvalidId",
    value: "true",
  },
  {
    readonly: false,
    key: "TransactionMessageAttempts",
    value: "5",
  },
  {
    readonly: false,
    key: "TransactionMessageRetryInterval",
    value: "60",
  },
  {
    readonly: false,
    key: "UnlockConnectorOnEVSideDisconnect",
    value: "true",
  },
  {
    readonly: true,
    key: "ChargingScheduleAllowedChargingRateUnit",
    value: "Current,Power",
  },
  {
    readonly: true,
    key: "ChargingScheduleMaxPeriods",
    value: "10",
  },
  {
    readonly: true,
    key: "MaxChargingProfilesInstalled",
    value: "100",
  },
  {
    readonly: false,
    key: "WebSocketUser",
    value: "alpitronic_HYC300",
  },
  {
    readonly: false,
    key: "WebSocketPassword",
    value: "abcDEF1234567890",
  },
  {
    readonly: false,
    key: "HycKioskModeEnabled",
    value: "false",
  },
  {
    readonly: false,
    key: "RemoteTxStoppableLocally",
    value: "false",
  },
  {
    readonly: false,
    key: "KioskModeWhenOffline",
    value: "true",
  },
  {
    readonly: false,
    key: "SendOcppSecurityNotifications",
    value: "false",
  },
  {
    readonly: true,
    key: "Connectors",
    value: '{"connectors":[{"maxCurrent":500,"pos":1,"type":"CCS"},{"maxCurrent":125,"pos":2,"type":"CHAdeMO"}]}',
  },
];

const connectors = [
  {
    maxCurrent: 500,
    type: "CCS" as ConnectorType
  },
  {
    maxCurrent: 125,
    type: "CHAdeMO" as ConnectorType
  },
];

export class AlpitronicHyc300 extends Simulator {
  constructor (options: Pick<SimulatorOptions, "chargePointIdentity" | "webSocketUrl" | "chargePointSerialNumber">) {
    super({
      ...options,
      configuration,
      connectors,
      model: ALPITRONIC_MODELS.HYC_300,
      vendor: VENDORS.ALPITRONIC,
    });
  }
}
