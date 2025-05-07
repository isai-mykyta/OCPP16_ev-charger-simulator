import { ConfigurationService } from "../../../simulator/configuration";

describe("ConfigurationService", () => {
  let configService: ConfigurationService;

  beforeEach(() => {
    configService = new ConfigurationService([
      {
        key: "ChargePointIdentity",
        value: "TEST.SIMULATOR",
        readonly: true
      },
      {
        key: "WebSocketPingInterval",
        value: "60",
        readonly: false
      }
    ]);
  });

  test("should return configuration", () => {
    const configuration = configService.getConfiguration();
    expect(configuration).toBeDefined();
    expect(configuration.length).toBeGreaterThan(1);
    expect(Object.keys(configuration[0])).toEqual(
      expect.arrayContaining(["key", "value", "readonly"])
    );
  });

  test("should return config by key", () => {
    const config = configService.findConfigByKey("ChargePointIdentity");
    expect(config).toBeDefined();
  });

  test("should update config by key if allowed", () => {
    const result = configService.updateConfigByKey("WebSocketPingInterval", "120");
    const config = configService.findConfigByKey("WebSocketPingInterval");
    expect(result).toBe(true);
    expect(config.value).toBe("120");
  });

  test("should not update config by key if not allowed", () => {
    const result = configService.updateConfigByKey("ChargePointIdentity", "NEW.IDENTITY");
    const config = configService.findConfigByKey("ChargePointIdentity");
    expect(result).toBe(false);
    expect(config.value).toBe("TEST.SIMULATOR");
  });
});
