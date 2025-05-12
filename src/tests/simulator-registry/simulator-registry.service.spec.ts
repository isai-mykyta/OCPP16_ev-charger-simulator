import { eventsService } from "../../events/events.service";
import { simulatorsRegistry, SimulatorState } from "../../simulator-registry";

describe("SimulatorsRegistry", () => {
  afterEach(() => {
    simulatorsRegistry.clear();
  });

  test("should add simulator once simulatorCreated emitted", () => {
    eventsService.emit("simulatorCreated", { identity: "TEST.SIMULATOR", cpmsUrl: "ws://127.0.0.1" });
    const isPresent = !!simulatorsRegistry.getSimulator("TEST.SIMULATOR");

    expect(isPresent).toBe(true);
  });

  test("should update simulator once simulatorConnected emitted", () => {
    eventsService.emit("simulatorCreated", { identity: "TEST.SIMULATOR", cpmsUrl: "ws://127.0.0.1" });
    eventsService.emit("simulatorConnected", { identity: "TEST.SIMULATOR" });

    const state = simulatorsRegistry.getSimulator("TEST.SIMULATOR");
    expect(state.isConnected).toBe(true);
  });

  test("should update simulator once simulatorDisconnected emitted", () => {
    eventsService.emit("simulatorCreated", { identity: "TEST.SIMULATOR", cpmsUrl: "ws://127.0.0.1" });
    eventsService.emit("simulatorConnected", { identity: "TEST.SIMULATOR" });
    eventsService.emit("simulatorDisconnected", { identity: "TEST.SIMULATOR" });

    const state = simulatorsRegistry.getSimulator("TEST.SIMULATOR");
    expect(state.isConnected).toBe(false);
  });
});
