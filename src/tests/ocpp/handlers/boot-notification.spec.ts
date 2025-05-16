import { RegistrationStatus } from "../../../ocpp";
import { handleBootNotificationResponse } from "../../../ocpp/handlers";
import { simulatorsRegistry } from "../../../registry";
import { TestSimulator } from "../../fixtures";

describe("handleBootNotificationResponse", () => {
  let testSimulator: TestSimulator;

  beforeEach(() => {
    testSimulator = new TestSimulator({
      chargePointIdentity: "TEST.SIMULATOR",
      configuration: [],
      model: "test-model",
      vendor: "test-vendor",
      webSocketUrl: `ws://127.0.0.1:8081`
    });
  
    simulatorsRegistry.addSimulator(testSimulator);
  });

  afterEach(() => {
    simulatorsRegistry.clear();
  });

  test("should handle OCPP boot notification response", () => {
    handleBootNotificationResponse(testSimulator, { 
      status: RegistrationStatus.PENDING, 
      interval: 120, 
      currentTime: new Date().toISOString() 
    });

    expect(testSimulator.registrationStatus).toBe(RegistrationStatus.PENDING);
    expect(testSimulator.heartbeatInterval).toBe(120);
  });
});
