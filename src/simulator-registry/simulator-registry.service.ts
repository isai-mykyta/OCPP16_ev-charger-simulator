import { SimulatorState } from "./state";
import { eventsService } from "../events/events.service";

class SimulatorsRegistry {
  private readonly simulators = new Map<string, SimulatorState>();

  constructor () {
    eventsService.on("simulatorCreated", ({ identity, cpmsUrl }) => {
      const state = new SimulatorState({ identity, cpmsUrl });
      this.addSimulator(state);
    });

    eventsService.on("simulatorDisconnected", ({ identity }) => {
      const state = this.getSimulator(identity);
      if (state) state.isConnected = false;
    });

    eventsService.on("simulatorConnected", ({ identity }) => {
      const state = this.getSimulator(identity);
      if (state) state.isConnected = true;
    });
  }

  private addSimulator(state: SimulatorState): void {
    this.simulators.set(state.identity, state);
  }

  public getSimulator(identity: string): SimulatorState {
    return this.simulators.get(identity);
  }

  public clear(): void {
    this.simulators.clear();
  }
}

export const simulatorsRegistry = new SimulatorsRegistry();
