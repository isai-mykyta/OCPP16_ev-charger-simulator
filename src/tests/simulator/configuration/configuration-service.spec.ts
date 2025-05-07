import { ConfigurationService } from "../../../simulator/configuration";

describe("ConfigurationService", () => {
  let configService: ConfigurationService;

  beforeEach(() => {
    configService = new ConfigurationService();
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
});
