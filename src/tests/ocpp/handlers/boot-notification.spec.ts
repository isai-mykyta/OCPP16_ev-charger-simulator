import { KeyValue, RegistrationStatus } from "../../../ocpp";
import { handleBootNotificationResponse } from "../../../ocpp/handlers";
import { TestSimulator } from "../../fixtures";

describe("handleBootNotificationResponse", () => {
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
  });

  test("should handle OCPP boot notification response", () => {
    handleBootNotificationResponse(simulator, { 
      status: RegistrationStatus.PENDING, 
      interval: 120, 
      currentTime: new Date().toISOString() 
    });

    expect(simulator.registrationStatus).toBe(RegistrationStatus.PENDING);
    expect(simulator.heartbeatInterval).toBe(120);
  });
});
