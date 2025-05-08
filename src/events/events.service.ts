import { EventEmitter } from "events";

import { Events } from "./types";

class EventsService extends EventEmitter {
  public emit<K extends keyof Events>(event: K, payload: Events[K]): boolean {
    return super.emit(event, payload);
  }

  public on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): this {
    return super.on(event, listener);
  }
}

export const eventsService = new EventsService();
