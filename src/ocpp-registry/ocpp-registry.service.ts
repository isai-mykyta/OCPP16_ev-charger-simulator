import { CallMessage, OcppMessage } from "../ocpp/types";

export class OcppRegistryService {
  private readonly ocppMessages = new Map<string, CallMessage<unknown>>();

  public getMessage(id: string): OcppMessage<unknown> {
    return this.ocppMessages.get(id);
  }

  public addMessage(message: CallMessage<unknown>): void {
    this.ocppMessages.set(message[1], message);
  }

  public removeMessage(id: string): void {
    this.ocppMessages.delete(id);
  }

  public clear(): void {
    this.ocppMessages.clear();
  }
}

export const ocppRegistry = new OcppRegistryService();
