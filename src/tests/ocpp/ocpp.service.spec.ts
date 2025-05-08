import { logger } from "../../logger";
import { 
  CallMessage, 
  OcppMessage, 
  OcppMessageAction, 
  OcppService, 
  RegistrationStatus 
} from "../../ocpp";
import { simulatorsRegistry, SimulatorState } from "../../registry";

describe("OCPP service", () => {
  const identity = "TEST.OCPP.SERVICE";
  let ocppService: OcppService;

  beforeEach(() => {
    ocppService = new OcppService({ identity });
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

  test("should not handle OCPP message when registration status is rejected", () => {
    simulatorsRegistry.addSimulator(new SimulatorState({ 
      identity, 
      registrationStatus: RegistrationStatus.REJECTED 
    }));

    const ocppMessage = [2, "id", OcppMessageAction.HEARTBEAT, {}] as CallMessage<object>;
    jest.spyOn(logger, "error");
    ocppService.handleMessage(ocppMessage);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  test("should not allow transaction requests while CS being rejected by Central System", () => {
    simulatorsRegistry.addSimulator(new SimulatorState({ 
      identity, 
      registrationStatus: RegistrationStatus.REJECTED 
    }));

    const startTransactionReq = [2, "id", OcppMessageAction.REMOTE_START_TRANSACTION, {}] as CallMessage<object>;
    const stopTransactionReq = [2, "id", OcppMessageAction.REMOTE_STOP_TRANSACTION, {}] as CallMessage<object>;

    jest.spyOn(logger, "error");

    ocppService.handleMessage(startTransactionReq);
    ocppService.handleMessage(stopTransactionReq);
    
    expect(logger.error).toHaveBeenCalledTimes(2);
  });
});
