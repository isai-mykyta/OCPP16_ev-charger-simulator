import { ConnectorType } from "../../connector";
import { logger } from "../../logger";
import { 
  CallMessage,
  KeyValue,
  OcppErrorCode,
  OcppMessage,
  OcppMessageAction,
  OcppHandlerService,
  RegistrationStatus
} from "../../ocpp";
import { TestSimulator } from "../fixtures";

describe("OCPP-handler service", () => {
  let ocppService: OcppHandlerService;
  let simulator: TestSimulator;

  beforeEach(() => {
    jest.useFakeTimers();
    
    simulator = new TestSimulator({
      chargePointIdentity: "TEST.SIMULATOR",
      configuration: [] as KeyValue[],
      model: "test-model",
      vendor: "test-vendor",
      webSocketUrl: `ws://127.0.0.1:8081`,
      chargePointSerialNumber: "000001",
      connectors: [
        {
          maxCurrent: 500,
          type: "CCS" as ConnectorType
        },
        {
          maxCurrent: 125,
          type: "CHAdeMO" as ConnectorType
        },
      ]
    });

    ocppService = new OcppHandlerService(simulator);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  test("should not handle invalid OCPP message", () => {
    const invalidOcppMessage = "invalid";
    jest.spyOn(logger, "error");
    ocppService.handleMessage(invalidOcppMessage as unknown as OcppMessage<unknown>);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  test("should not handle invalid OCPP array message", () => {
    const invalidOcppMessage = [5];
    jest.spyOn(logger, "error");
    ocppService.handleMessage(invalidOcppMessage as unknown as OcppMessage<unknown>);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  test("should not handle invalid OCPP call message", () => {
    const invalidOcppCallMessage = [2, "id", OcppMessageAction.HEARTBEAT, {}, {}] as unknown as OcppMessage<unknown>;
    jest.spyOn(logger, "error");
    ocppService.handleMessage(invalidOcppCallMessage);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  test("should not handle OCPP message when registration status is rejected", () => {
    simulator.registrationStatus = RegistrationStatus.REJECTED;
    const ocppMessage = [2, "id", OcppMessageAction.HEARTBEAT, {}] as CallMessage<object>;
    jest.spyOn(logger, "error");
    ocppService.handleMessage(ocppMessage);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  test("should not allow transaction requests while CS being rejected by Central System", () => {
    simulator.registrationStatus = RegistrationStatus.PENDING;
    const startTransactionReq = [2, "id", OcppMessageAction.REMOTE_START_TRANSACTION, {}] as CallMessage<object>;
    const stopTransactionReq = [2, "id", OcppMessageAction.REMOTE_STOP_TRANSACTION, {}] as CallMessage<object>;

    jest.spyOn(logger, "error");

    ocppService.handleMessage(startTransactionReq);
    ocppService.handleMessage(stopTransactionReq);
    
    expect(logger.error).toHaveBeenCalledTimes(2);
  });

  test("should return OCPP error message if OCPP request payload is invalid", () => {
    const invalidOcppCallMessage = [2, "id", OcppMessageAction.BOOT_NOTIFICATION, {}] as OcppMessage<unknown>;
    const response = ocppService.handleMessage(invalidOcppCallMessage);

    expect(response[0]).toBe(4);
    expect(response[1]).toBe("id");
    expect(response.length).toBe(5);
  });

  test("should return NOT_IMPLEMENTED exception if request action is uknown", () => {
    const callMessage = [2, "id", "UknownAction" as OcppMessageAction, {}] as OcppMessage<unknown>;
    const response = ocppService.handleMessage(callMessage);

    expect(response[0]).toBe(4);
    expect(response[1]).toBe("id");
    expect(response[2]).toStrictEqual(OcppErrorCode.NOT_IMPLEMENTED);
  });
});
