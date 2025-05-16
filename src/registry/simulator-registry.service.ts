import { Simulator } from "../simulator/simulator";

class SimulatorsRegistry {
  private readonly simulators = new Map<string, Simulator>();

  public addSimulator(simulator: Simulator): void {
    this.simulators.set(simulator.identity, simulator);
  }

  public getSimulator(identity: string): Simulator {
    return this.simulators.get(identity);
  }

  public clear(): void {
    this.simulators.clear();
  }
}

export const simulatorsRegistry = new SimulatorsRegistry();
