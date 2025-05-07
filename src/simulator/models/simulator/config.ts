export const configuration = [
  /**
   * If this key exists, the Charge Point supports Unknown Offline Authorization. 
   * If this key reports a value of true, Unknown Offline Authorization is enabled.
   */
  {
    key: "AllowOfflineTxForUnknownId",
    value: "false",
    readonly: false,
  },
  /**
   * If this key exists, the Charge Point supports an Authorization Cache. 
   * If this key reports a value of true, the Authorization Cacheis enabled.
   */
  {
    key: "AuthorizationCacheEnabled",
    value: "false",
    readonly: false,
  },
  /**
   * Whether a remote request to start a transaction in the form of a RemoteStartTransaction.req  message should be authorized beforehand like a local action to start a transaction.
   */
  {
    key: "AuthorizeRemoteTxRequests",
    value: "false",
    readonly: false,
  },
  /**
   * Size (in seconds) of the clock-aligned data interval. 
   * This is the size (in seconds) of the set of evenly spaced aggregation intervals per day, starting at 00:00:00 (midnight). 
   * For example, a value of 900 (15 minutes) indicates that every day should be broken into 96 15-minute intervals.
   * When clock aligned data is being transmitted, the interval in question is identified by the start time and (optional) duration interval value, represented according to the ISO8601 standard. 
   * All "per-period" data (e.g. energy readings) should be accumulated (for "flow" type measurands such as energy), or averaged (for other values) across the entire interval (or partial interval, at the beginning or end of a Transaction), and transmitted (if so enabled) at the end of each interval, bearing the interval start time timestamp.
   * A value of "0" (numeric zero), by convention, is to be interpreted to mean that no clock-aligned data should be transmitted.
   */
  {
    key: "ClockAlignedDataInterval",
    value: "900",
    readonly: false,
  },
  /**
   * Interval *from beginning of status: 'Preparing' until incipient Transaction is automatically canceled, due to failure of EV driver to (correctly) insert the charging cable connector(s) into the appropriate socket(s). The Charge Point SHALL go back to the original state, probably: 'Available'.
   */
  {
    key: "ConnectionTimeOut",
    value: "100",
    readonly: false,
  },
  /**
   * The phase rotation per connector in respect to the connector’s electrical meter (or if absent, the grid connection). 
   * Possible values per connector are:
   * NotApplicable (for Single phase or DC Charge Points)
   * Unknown (not (yet) known)
   * RST (Standard Reference Phasing)
   * RTS (Reversed Reference Phasing)
   * SRT (Reversed 240 degree rotation)
   * STR (Standard 120 degree rotation)
   * TRS (Standard 240 degree rotation)
   * TSR (Reversed 120 degree rotation)
   * R can be identified as phase 1 (L1), S as phase 2 (L2), T as phase 3 (L3).
   * If known, the Charge Point MAY also report the phase rotation between the grid connection and the main energymeter by using index number Zero (0).
   * Values are reported in CSL, formatted: 0.RST, 1.RST, 2.RTS
   */
  {
    key: "ConnectorPhaseRotation",
    value: "0.RST,1.RST,2.RTS",
    readonly: false,
  },
  /**
   * Maximum number of items in a ConnectorPhaseRotation Configuration Key.
   */
  {
    key: "ConnectorPhaseRotationMaxLength",
    value: "20",
    readonly: true,
  },
  /**
   * Maximum number of requested configuration keys in a GetConfiguration.req PDU.
   */
  {
    key: "GetConfigurationMaxKeys",
    value: "100",
    readonly: true,
  },
  /**
   * Interval of inactivity (no OCPP exchanges) with central system after which the Charge Point should send a Heartbeat.req PDU
   */
  {
    key: "HeartbeatInterval",
    value: "3600",
    readonly: false,
  },
  /**
   * Percentage of maximum intensity at which to illuminate Charge Point lighting
   */
  {
    key: "LightIntensity",
    value: "10",
    readonly: false,
  },
  /**
   * whether the Charge Point, when offline, will start a transaction for locally-authorized identifiers.
   */
  {
    key: "LocalAuthorizeOffline",
    value: "false",
    readonly: false,
  },
  /**
   * whether the Charge Point, when online, will start a transaction for locally-authorized identifiers without waiting for or requesting an Authorize.conf from the Central System
   */
  {
    key: "LocalPreAuthorize",
    value: "false",
    readonly: false,
  },
  /**
   * Maximum energy in Wh delivered when an identifier is invalidated by the Central System after start of a transaction.
   */
  {
    key: "MaxEnergyOnInvalidId",
    value: "100",
    readonly: false,
  },
  /**
   * Clock-aligned measurand(s) to be included in a MeterValues.req PDU, every ClockAlignedDataInterval seconds
   */
  {
    key: "MeterValuesAlignedData",
    value: "Current.Export",
    readonly: false,
  },
  /**
   * Maximum number of items in a MeterValuesAlignedData Configuration Key.
   */
  {
    key: "MeterValuesAlignedDataMaxLength",
    value: "10",
    readonly: true,
  },
  /**
   * Sampled measurands to be included in a MeterValues.req PDU, every MeterValueSampleInterval seconds. 
   * Where applicable, the Measurand is combined with the optional phase; 
   * for instance: Voltage.L1 Default: "Energy.Active.Import.Register"
   */
  {
    key: "MeterValuesSampledData",
    value: "Energy.Active.Import.Register",
    readonly: false,
  },
  /**
   * Maximum number of items in a MeterValuesSampledData Configuration Key.
   */
  {
    key: "MeterValuesSampledDataMaxLength",
    value: "10",
    readonly: true,
  },
  /**
   * Interval between sampling of metering (or other) data, intended to be transmitted by "MeterValues" PDUs. 
   * For charging session data (ConnectorId>0), samples are acquired and transmitted periodically at this interval from the start of the charging transaction.
   * A value of "0" (numeric zero), by convention, is to be interpreted to mean that no sampled data should be transmitted.
   */
  {
    key: "MeterValueSampleInterval",
    value: "10",
    readonly: false,
  },
  /**
   * The minimum duration that a Charge Point or Connector status is stable before a StatusNotification.req PDU is sent to the Central System.
   */
  {
    key: "MinimumStatusDuration",
    value: "100",
    readonly: false,
  },
  /**
   * The number of physical charging connectors of this Charge Point.
   */
  {
    key: "NumberOfConnectors",
    value: "1",
    readonly: true,
  },
  /**
   * Number of times to retry an unsuccessful reset of the Charge Point.
   */
  {
    key: "ResetRetries",
    value: "3",
    readonly: false,
  },
  /**
   * When set to true, the Charge Point SHALL administratively stop the transaction when the cable is unplugged from the EV.
   */
  {
    key: "StopTransactionOnEVSideDisconnect",
    value: "true",
    readonly: false,
  },
  /**
   * whether the Charge Point will stop an ongoing transaction when it receives a non- Accepted authorization status in a StartTransaction.conf for this transaction
   */
  {
    key: "StopTransactionOnInvalidId",
    value: "true",
    readonly: false,
  },
  /**
   * Clock-aligned periodic measurand(s) to be included in the TransactionData element of StopTransaction.req MeterValues.req PDU for every ClockAlignedDataInterval of the Transaction
   */
  {
    key: "StopTxnAlignedData",
    value: "Energy.Active.Import.Register,Current.Import.L1,Voltage.L1",
    readonly: false,
  },
  /**
   * Maximum number of items in a StopTxnAlignedData Configuration Key.
   */
  {
    key: "StopTxnAlignedDataMaxLength",
    value: "15",
    readonly: true,
  },
  /**
   * Sampled measurands to be included in the TransactionData element of StopTransaction.req PDU, every MeterValueSampleInterval seconds from the start of the charging session
   */
  {
    key: "StopTxnSampledData",
    value: "Energy.Active.Import.Register,Current.Import.L1,Voltage.L1",
    readonly: false,
  },
  /**
   * Maximum number of items in a StopTxnSampledData Configuration Key.
   */
  {
    key: "StopTxnSampledDataMaxLength",
    value: "5",
    readonly: true,
  },
  /**
   * A list of supported Feature Profiles. Possible profile identifiers: Core, FirmwareManagement, LocalAuthListManagement, Reservation, SmartCharging and RemoteTrigger.
   */
  {
    key: "SupportedFeatureProfiles",
    value: "Core,Firmware Management,Local Auth List Management,Reservation,Smart Charging,Remote Trigger",
    readonly: true,
  },
  /**
   * Maximum number of items in a SupportedFeatureProfiles Configuration Key.
   */
  {
    key: "SupportedFeatureProfilesMaxLength",
    value: "15",
    readonly: true,
  },
  /**
   * How often the Charge Point should try to submit a transaction-related message when the Central System fails to process it.
   */
  {
    key: "TransactionMessageAttempts",
    value: "3",
    readonly: false,
  },
  /**
   * How long the Charge Point should wait before resubmitting a transaction-related message that the Central System failed to How long the Charge Point should wait before resubmitting a transaction-related message that the Central System failed to process.
   */
  {
    key: "TransactionMessageRetryInterval",
    value: "10",
    readonly: false,
  },
  /**
   * When set to true, the Charge Point SHALL unlock the cable on Charge Point side when the cable is unplugged at the EV.
   */
  {
    key: "UnlockConnectorOnEVSideDisconnect",
    value: "false",
    readonly: false,
  },
  /**
   * Only relevant for websocket implementations. 
   * 0 disables client side websocket Ping/Pong. 
   * In this case there is either no ping/pong or the server initiates the ping and client responds with Pong. 
   * Positive values are interpreted as number of seconds between pings. 
   * Negative values are not allowed. 
   * ChangeConfiguration is expected to return a REJECTED result.
   */
  {
    key: "WebSocketPingInterval",
    value: "60",
    readonly: false,
  },
  /**
   * whether the Local Authorization List is enabled
   */
  {
    key: "LocalAuthListEnabled",
    value: "false",
    readonly: false,
  },
  /**
   * Maximum number of identifications that can be stored in the Local Authorization List
   */
  {
    key: "LocalAuthListMaxLength",
    value: "5",
    readonly: true,
  },
  /**
   * Maximum number of identifications that can be send in a single SendLocalList.req
   */
  {
    key: "SendLocalListMaxLength",
    value: "10",
    readonly: true,
  },
  /**
   * If this configuration key is present and set to true: 
   * Charge Point support reservations on connector 0.
   */
  {
    key: "ReserveConnectorZeroSupported",
    value: "false",
    readonly: true,
  },
  /**
   * Max StackLevel of a ChargingProfile. 
   * The number defined also indicates the max allowed number of installed charging schedules per Charging Profile Purposes.
   */
  {
    key: "ChargeProfileMaxStackLevel",
    value: "10",
    readonly: true,
  },
  /**
   * A list of supported quantities for use in a ChargingSchedule. 
   * Allowed values: 'Current' and 'Power'
   */
  {
    key: "ChargingScheduleAllowedChargingRateUnit",
    value: "Current",
    readonly: true,
  },
  /**
   * Maximum number of periods that may be defined per ChargingSchedule.
   */
  {
    key: "ChargingScheduleMaxPeriods",
    value: "10",
    readonly: true,
  },
  /**
   * If defined and true, this Charge Point support switching from 3 to 1 phase during a Transaction.
   */
  {
    key: "ConnectorSwitch3to1PhaseSupported",
    value: "false",
    readonly: true,
  },
  /**
   * Maximum number of Charging profiles installed at a time
   */
  {
    key: "MaxChargingProfilesInstalled",
    value: "1",
    readonly: true,
  },
  {
    key: "WebSocketUrl",
    value: "",
    readonly: true,
  },
  {
    key: "ChargePointIdentity",
    value: "",
    readonly: true
  }
];
