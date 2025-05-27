import { ConfigurationStatus, KeyValue } from "../../../ocpp";
import { handleChangeConfigurationRequest } from "../../../ocpp/handlers";
import { TestSimulator } from "../../fixtures";

describe("HandleChangeConfigurationRequest", () => {
  let simulator: TestSimulator;
  
  beforeEach(() => {
    simulator = new TestSimulator({
      chargePointIdentity: "TEST.SIMULATOR",
      configuration: [
        {
          key: "1",
          value: "1",
          readonly: false,
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
      ] as KeyValue[],
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

  test("Should update config key and return accepted status", () => {
    const res = handleChangeConfigurationRequest(simulator, { key: "1", value: "11" });
    const config = simulator.configuration.find(({ key }) => key === "1");

    expect(res.status).toBe(ConfigurationStatus.ACCEPTED);
    expect(config.value).toBe("11");
  });

  test("Should return rejected status", () => {
    const res = handleChangeConfigurationRequest(simulator, { key: "2", value: "22" });
    const config = simulator.configuration.find(({ key }) => key === "2");

    expect(res.status).toBe(ConfigurationStatus.REJECTED);
    expect(config.value).toBe("2");
  });

  test("Should return not supported status", () => {
    const res = handleChangeConfigurationRequest(simulator, { key: "20", value: "22" });
    expect(res.status).toBe(ConfigurationStatus.NOT_SUPPORTED);
  });
});
