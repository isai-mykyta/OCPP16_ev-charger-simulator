import { ConfigurationService } from "../configuration";
import { CallMessage, CallResultMessage } from "../ocpp";

export type SimulatorCreatedPayload = {
  identity: string;
  cpmsUrl: string;
  configuration: ConfigurationService;
}

export type Events = {
  simulatorCreated: SimulatorCreatedPayload,
  simulatorConnected: { identity: string },
  simulatorDisconnected: { identity: string },
  ocppMessageSent: { message: CallMessage<unknown> },
  ocppResponseReceived: { message: CallResultMessage<unknown> }
}
