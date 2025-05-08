export type SimulatorCreatedPayload = {
  identity: string;
  cpmsUrl: string;
}

export type Events = {
  simulatorCreated: SimulatorCreatedPayload,
  simulatorConnected: { identity: string },
  simulatorDisconnected: { identity: string },
}
