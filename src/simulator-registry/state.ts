import { RegistrationStatus } from "../ocpp";

export type StateOptions = {
  identity: string;
  isConnected?: boolean;
  cpmsUrl?: string;
  registrationStatus?: RegistrationStatus;
}

export class SimulatorState {
  public identity: string;
  public isConnected: boolean;
  public cpmsUrl: string;
  public registrationStatus: RegistrationStatus;

  constructor (options: StateOptions) {
    this.identity = options.identity;
    this.isConnected = options.isConnected || false;
    this.cpmsUrl = options.cpmsUrl || "";
    this.registrationStatus = options.registrationStatus || null;
  }
}
