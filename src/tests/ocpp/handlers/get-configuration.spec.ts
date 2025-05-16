import { handleGetConfigurationRequest } from "../../../ocpp/handlers";
import { simulatorsRegistry } from "../../../registry";
import { TestSimulator } from "../../fixtures";

describe("handleGetConfigurationRequest", () => {
  let testSimulator: TestSimulator;
  
  beforeEach(() => {
    testSimulator = new TestSimulator({
      chargePointIdentity: "TEST.SIMULATOR",
      configuration: [
        {
          key: "1",
          value: "1",
          readonly: true,
        },
        {
          key: "2",
          value: "2",
          readonly: true,
        },
        {
          key: "3",
          value: "3",
          readonly: true,
        }
      ],
      model: "test-model",
      vendor: "test-vendor",
      webSocketUrl: `ws://127.0.0.1:8081`,
    });
    
    simulatorsRegistry.addSimulator(testSimulator);
  });
  
  afterEach(() => {
    simulatorsRegistry.clear();
  });

  test("should handle OCPP get configuration request with empty payload", () => {
    const response = handleGetConfigurationRequest(testSimulator, {});
    expect(response.configurationKey).toHaveLength(3);
  });

  test("should handle OCPP get configuration request with defined keys", () => {
    const response = handleGetConfigurationRequest(testSimulator, { key: ["1"] });
    expect(response.configurationKey).toHaveLength(1);
    expect(response.configurationKey[0].key).toBe("1");
  });

  test("should handle OCPP get configuration request with unknown keys", () => {
    const response = handleGetConfigurationRequest(testSimulator, { key: ["10"] });
    expect(response.configurationKey).toHaveLength(0);
    expect(response.unknownKey).toHaveLength(1);
    expect(response.unknownKey[0]).toBe("10");
  });

  test("should handle OCPP get configuration request and return known and unknown keys", () => {
    const response = handleGetConfigurationRequest(testSimulator, { key: ["10", "1"] });
    expect(response.configurationKey).toHaveLength(1);
    expect(response.unknownKey).toHaveLength(1);

    expect(response.configurationKey[0].key).toBe("1");
    expect(response.unknownKey[0]).toBe("10");
  });
});
