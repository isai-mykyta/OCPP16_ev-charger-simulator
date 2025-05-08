export type StateOptions = {
  identity: string;
  isConnected?: boolean;
  cpmsUrl?: string;
}

export class SimulatorState {
  public identity: string;
  public isConnected: boolean;
  public cpmsUrl: string;

  constructor (options: StateOptions) {
    this.identity = options.identity;
    this.isConnected = options.isConnected || false;
    this.cpmsUrl = options.cpmsUrl || "";
  }
}
