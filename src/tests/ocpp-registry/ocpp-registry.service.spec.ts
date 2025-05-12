import { eventsService } from "../../events/events.service";
import { OcppMessageAction } from "../../ocpp";
import { ocppRegistry } from "../../ocpp-registry";

describe("OcppRegistryService", () => {
  afterEach(() => {
    ocppRegistry.clear();
  });

  test("should add ocpp message once ocppMessageSent emitted", () => {
    eventsService.emit("ocppMessageSent", { message: [2, "id", OcppMessageAction.HEARTBEAT, {}] });
    const isPresent = !!ocppRegistry.getMessage("id");
    expect(isPresent).toBe(true);
  });

  test("should remove ocpp message once ocppResponseReceived emitted", () => {
    eventsService.emit("ocppMessageSent", { message: [2, "id", OcppMessageAction.HEARTBEAT, {}] });
    eventsService.emit("ocppResponseReceived", { message: [3, "id", {}] });
    const isPresent = !!ocppRegistry.getMessage("id");
    expect(isPresent).toBe(false);
  });
});
