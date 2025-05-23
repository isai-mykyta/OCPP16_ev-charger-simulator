import { logger } from "../../logger";
import { 
  CallMessage, 
  OcppErrorCode, 
  OcppMessage, 
  OcppMessageAction, 
  OcppMessageType, 
  OcppService, 
  RegistrationStatus 
} from "../../ocpp";
import { simulatorsRegistry } from "../../registry";
import { TestSimulator } from "../fixtures";

describe("OCPP service", () => {
  let ocppService: OcppService;
  let testSimulator: TestSimulator;

  beforeEach(() => {
    testSimulator = new TestSimulator({
      chargePointIdentity: "TEST.SIMULATOR",
      configuration: [],
      model: "test-model",
      vendor: "test-vendor",
      webSocketUrl: `ws://127.0.0.1:8081`,
      connectors: [
        {
          type: "Type1"
        }
      ]
    });

    simulatorsRegistry.addSimulator(testSimulator);
    ocppService = new OcppService(testSimulator.identity);
  });

  afterEach(() => {
    jest.resetAllMocks();
    simulatorsRegistry.clear();
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
    jest.useFakeTimers();
    testSimulator.registrationStatus = RegistrationStatus.REJECTED;
    const ocppMessage = [2, "id", OcppMessageAction.HEARTBEAT, {}] as CallMessage<object>;
    jest.spyOn(logger, "error");
    ocppService.handleMessage(ocppMessage);
    expect(logger.error).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  test("should not allow transaction requests while CS being rejected by Central System", () => {
    jest.useFakeTimers();
    testSimulator.registrationStatus = RegistrationStatus.PENDING;
    const startTransactionReq = [2, "id", OcppMessageAction.REMOTE_START_TRANSACTION, {}] as CallMessage<object>;
    const stopTransactionReq = [2, "id", OcppMessageAction.REMOTE_STOP_TRANSACTION, {}] as CallMessage<object>;

    jest.spyOn(logger, "error");

    ocppService.handleMessage(startTransactionReq);
    ocppService.handleMessage(stopTransactionReq);
    
    expect(logger.error).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  test("should return OCPP error message if OCPP request payload is invalid", () => {
    jest.useFakeTimers();
    const invalidOcppCallMessage = [2, "id", OcppMessageAction.BOOT_NOTIFICATION, {}] as OcppMessage<unknown>;
    const ocppError = ocppService.handleMessage(invalidOcppCallMessage);

    expect(ocppError[0]).toBe(4);
    expect(ocppError[1]).toBe("id");
    expect(ocppError.length).toBe(5);
    jest.useRealTimers();
  });

  test("should return NOT_IMPLEMENTED exception if request action is uknown", () => {
    const callMessage = [2, "id", "UknownAction" as OcppMessageAction, {}] as OcppMessage<unknown>;
    const ocppError = ocppService.handleMessage(callMessage);

    expect(ocppError[0]).toBe(4);
    expect(ocppError[1]).toBe("id");
    expect(ocppError[2]).toStrictEqual(OcppErrorCode.NOT_IMPLEMENTED);
  });

  test("should constrcut boot notification request", () => {
    const request = ocppService.bootNotificationReq();
    expect(request[0]).toBe(OcppMessageType.CALL);
    expect(typeof request[1]).toBe("string");
    expect(request[2]).toBe(OcppMessageAction.BOOT_NOTIFICATION);
    expect(request[3]).toBeDefined();
  });
});
