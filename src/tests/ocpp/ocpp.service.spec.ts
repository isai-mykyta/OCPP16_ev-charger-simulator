import { logger } from "../../logger";
import { 
  CallMessage, 
  KeyValue, 
  OcppErrorCode, 
  OcppMessage, 
  OcppMessageAction, 
  OcppMessageType, 
  OcppService, 
  RegistrationStatus 
} from "../../ocpp";
import { TestSimulator } from "../fixtures";


describe("OCPP service", () => {
  let ocppService: OcppService;
  let simulator: TestSimulator;

  beforeEach(() => {
    simulator = new TestSimulator({
      chargePointIdentity: "TEST.SIMULATOR",
      configuration: [] as KeyValue[],
      model: "test-model",
      vendor: "test-vendor",
      webSocketUrl: `ws://127.0.0.1:8081`,
      connectors: [
        {
          type: "Type1"
        }
      ]
    });

    ocppService = new OcppService(simulator);
  });

  afterEach(() => {
    jest.resetAllMocks();
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
    simulator.registrationStatus = RegistrationStatus.REJECTED;
    const ocppMessage = [2, "id", OcppMessageAction.HEARTBEAT, {}] as CallMessage<object>;
    jest.spyOn(logger, "error");
    ocppService.handleMessage(ocppMessage);
    expect(logger.error).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  test("should not allow transaction requests while CS being rejected by Central System", () => {
    jest.useFakeTimers();
    simulator.registrationStatus = RegistrationStatus.PENDING;
    const startTransactionReq = [2, "id", OcppMessageAction.REMOTE_START_TRANSACTION, {}] as CallMessage<object>;
    const stopTransactionReq = [2, "id", OcppMessageAction.REMOTE_STOP_TRANSACTION, {}] as CallMessage<object>;

    jest.spyOn(logger, "error");

    ocppService.handleMessage(startTransactionReq);
    ocppService.handleMessage(stopTransactionReq);
    
    expect(logger.error).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  test("should return OCPP error message if OCPP request payload is invalid", (done) => {
    jest.useFakeTimers();

    const subscription = ocppService.ocppResponse$.subscribe((ocppError) => {
      expect(ocppError[0]).toBe(4);
      expect(ocppError[1]).toBe("id");
      expect(ocppError.length).toBe(5);
      done();
    });

    const invalidOcppCallMessage = [2, "id", OcppMessageAction.BOOT_NOTIFICATION, {}] as OcppMessage<unknown>;
    ocppService.handleMessage(invalidOcppCallMessage);

    jest.useRealTimers();
    subscription.unsubscribe();
  });

  test("should return NOT_IMPLEMENTED exception if request action is uknown", (done) => {
    const subscription = ocppService.ocppResponse$.subscribe((ocppError) => {
      expect(ocppError[0]).toBe(4);
      expect(ocppError[1]).toBe("id");
      expect(ocppError[2]).toStrictEqual(OcppErrorCode.NOT_IMPLEMENTED);
      done();
    });

    const callMessage = [2, "id", "UknownAction" as OcppMessageAction, {}] as OcppMessage<unknown>;
    ocppService.handleMessage(callMessage);
    subscription.unsubscribe();
  });

  test("should constrcut boot notification request", () => {
    const request = ocppService.bootNotificationReq();
    expect(request[0]).toBe(OcppMessageType.CALL);
    expect(typeof request[1]).toBe("string");
    expect(request[2]).toBe(OcppMessageAction.BOOT_NOTIFICATION);
    expect(request[3]).toBeDefined();
  });
});
