import { ConfigurationService } from "../../configuration";
import { eventsService } from "../../events/events.service";
import { simulatorsRegistry } from "../../simulator-registry";

const identity = "TEST.SIMULATOR";

const configuration = [
  {
    key: "WebSocketUrl",
    readonly: true,
    value: "ws://127.0.0.1:8080"
  },
  {
    key: "ChargePointIdentity",
    readonly: true,
    value: identity
  },
  {
    key: "WebSocketPingInterval",
    readonly: true,
    value: "60"
  },
];

const testSimulatorData = {
  identity, 
  cpmsUrl: "ws://127.0.0.1",
  model: "test-model",
  vendor: "test-vendor",
  configuration: new ConfigurationService(configuration)
};

describe("SimulatorsRegistry", () => {
  afterEach(() => {
    simulatorsRegistry.clear();
  });

  test("should add simulator once simulatorCreated emitted", () => {
    eventsService.emit("simulatorCreated", testSimulatorData);
    const isPresent = !!simulatorsRegistry.getSimulator("TEST.SIMULATOR");

    expect(isPresent).toBe(true);
  });

  test("should update simulator once simulatorConnected emitted", () => {
    eventsService.emit("simulatorCreated", testSimulatorData);
    eventsService.emit("simulatorConnected", { identity: "TEST.SIMULATOR" });

    const state = simulatorsRegistry.getSimulator("TEST.SIMULATOR");
    expect(state.isConnected).toBe(true);
  });

  test("should update simulator once simulatorDisconnected emitted", () => {
    eventsService.emit("simulatorCreated", testSimulatorData);
    eventsService.emit("simulatorConnected", { identity: "TEST.SIMULATOR" });
    eventsService.emit("simulatorDisconnected", { identity: "TEST.SIMULATOR" });

    const state = simulatorsRegistry.getSimulator("TEST.SIMULATOR");
    expect(state.isConnected).toBe(false);
  });
});
