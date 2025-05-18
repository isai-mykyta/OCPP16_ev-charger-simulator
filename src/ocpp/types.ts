export enum OcppMessageType {
  CALL = 2,
  RESULT = 3,
  ERROR = 4
}

export enum OcppMessageAction {
  HEARTBEAT = "Heartbeat",
  RESET = "Reset",
  BOOT_NOTIFICATION = "BootNotification",
  GET_CONFIGURATION = "GetConfiguration",
  CHANGE_CONFIGURATION = "ChangeConfiguration",
  REMOTE_STOP_TRANSACTION = "RemoteStopTransaction",
  REMOTE_START_TRANSACTION = "RemoteStartTransaction",
  STATUS_NOTIFICATION = "StatusNotification",
}

export enum OcppErrorCode {
  NOT_IMPLEMENTED = "NotImplemented", // Requested Action is not known by receiver
  NOT_SUPPORTED = "NotSupported", // Requested Action is recognized but not supported by the receiver
  INTERNAL_ERROR = "InternalError", // An internal error occurred and the receiver was not able to process the requested Action successfully
  PROTOCOL_ERROR = "ProtocolError", // Payload for Action is incomplete
  SECURITY_ERROR = "SecurityError", // During the processing of Action a security issue occurred preventing receiver from completing the Action successfully
  FORMATION_VIOLATION = "FormationViolation", // Payload for Action is syntactically incorrect or not conform the PDU structure for Action
  PROPERTY_CONSTRAINT_VIOLATION = "PropertyConstraintViolation", // Payload is syntactically correct but at least one field contains an invalid value
  OCCURENCE_CONSTRAINT_VIOLATION = "OccurenceConstraintViolation", // Payload for Action is syntactically correct but at least one of the fields violates occurence constraints
  TYPE_CONSTRAINT_VIOLATION = "TypeConstraintViolation", // Payload for Action is syntactically correct but at least one of the fields violates data type constraints
  GENERIC_ERROR = "GenericError" // Any other error not covered by the previous ones
}

export enum RegistrationStatus {
  ACCEPTED = "Accepted",
  PENDING = "Pending",
  REJECTED = "Rejected"
}

export enum ConfigurationStatus {
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
  REBOOT_REQUIRED = "RebootRequired",
  NOT_SUPPORTED = "NotSupported"
}

export enum ChargePointStatus {
  AVAILABLE = "Available",
  PREPARING = "Preparing",
  CHARGING = "Charging",
  SUSPENDED_EVSE = "SuspendedEVSE",
  SUSPENDED_EV = "SuspendedEV",
  FINISHING = "Finishing",
  RESERVED = "Reserved",
  UNAVAILABLE = "Unavailable",
  FAULTED = "Faulted"
}

export enum ChargePointErrorCode {
  CONNECTOR_LOCK_FAILURE = "ConnectorLockFailure",
  EV_COMMUNICATION_ERROR = "EVCommunicationError",
  GROUND_FAILURE = "GroundFailure",
  HIGH_TEMPERATURE = "HighTemperature",
  INTERNAL_ERROR = "InternalError",
  LOCAL_LIST_CONFLICT = "LocalListConflict",
  NO_ERROR = "NoError",
  OTHER_ERROR = "OtherError",
  OVER_CURRENT_FAILURE = "OverCurrentFailure",
  OVER_VOLTAGE = "OverVoltage",
  POWER_METER_FAILURE = "PowerMeterFailure",
  POWER_SWITCH_FAILURE = "PowerSwitchFailure",
  READER_FAILURE = "ReaderFailure",
  RESET_FAILURE = "ResetFailure",
  UNDER_VOLTAGE = "UnderVoltage",
  WEAK_SIGNAL = "WeakSignal"
}

export type CallMessage<P> = [OcppMessageType.CALL, string, OcppMessageAction, P];
export type CallResultMessage<P> = [OcppMessageType.RESULT, string, P];
export type CallErrorMessage = [OcppMessageType.ERROR, string, OcppErrorCode, string, string];
export type OcppMessage<P> = CallMessage<P> | CallResultMessage<P> | CallErrorMessage;

export type BootNotificationReq = {
  chargeBoxSerialNumber?: string;
  chargePointModel: string;
  chargePointSerialNumber?: string;
  chargePointVendor: string;
  firmwareVersion?: string;
  iccid?: string;
  imsi?: string;
  meterSerialNumber?: string;
  meterType?: string;
}

export type BootNotificationConf = {
  currentTime: string;
  interval: number;
  status: RegistrationStatus;
}

export type KeyValue = {
  key: string;
  readonly: boolean;
  value?: string;
}

export type GetConfigurationReq = {
  key?: string[];
}

export type GetConfigurationConf = {
  configurationKey?: KeyValue[];
  unknownKey?: string[];
}

export type ChangeConfigurationReq = {
  key: string;
  value: string;
}

export type ChangeConfigurationConf = {
  status: ConfigurationStatus;
}

export type StatusNotificationReq = {
  connectorId: number;
  errorCode: ChargePointErrorCode;
  info?: string;
  status: ChargePointStatus;
  timestamp?: string;
  vendorId?: string;
  vendorErrorCode?: string;
}
