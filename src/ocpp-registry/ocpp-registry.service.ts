import { eventsService } from "../events/events.service";
import { CallMessage } from "../ocpp/types";

export class OcppRegistryService {
  private readonly ocppMessages = new Map<string, CallMessage<unknown>>();

  constructor () {
    eventsService.on("ocppResponseReceived", ({ message }) => {
      this.removeMessage(message[1]);
    });

    eventsService.on("ocppMessageSent", ({ message }) => {
      this.addMessage(message);
    });
  }

  public getMessage(id: string): CallMessage<unknown> {
    return this.ocppMessages.get(id);
  }

  private addMessage(message: CallMessage<unknown>): void {
    this.ocppMessages.set(message[1], message);
  }

  private removeMessage(id: string): void {
    this.ocppMessages.delete(id);
  }

  public clear(): void {
    this.ocppMessages.clear();
  }
}

export const ocppRegistry = new OcppRegistryService();
