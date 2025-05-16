import { simulatorsRegistry } from "../../registry";
import { TestSimulator } from "../fixtures";

describe("SimulatorsRegistry", () => {
  let testSimulator: TestSimulator;

  beforeEach(() => {
    testSimulator = new TestSimulator({
      chargePointIdentity: "TEST.SIMULATOR",
      configuration: [],
      model: "test-model",
      vendor: "test-vendor",
      webSocketUrl: `ws://127.0.0.1:8081`
    });
  });

  afterEach(() => {
    simulatorsRegistry.clear();
  });

  test("should add simulator", () => {
    simulatorsRegistry.addSimulator(testSimulator);
    const simulator = simulatorsRegistry.getSimulator(testSimulator.identity);

    expect(simulator).toBeDefined();
    expect(simulator.identity).toBe(testSimulator.identity);
  });

  test("should clear simulators", () => {
    simulatorsRegistry.addSimulator(testSimulator);
    simulatorsRegistry.clear();
    
    const simulator = simulatorsRegistry.getSimulator(testSimulator.identity);
    expect(simulator).toBe(undefined);
  });
});
