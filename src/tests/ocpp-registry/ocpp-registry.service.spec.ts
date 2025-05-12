import { OcppMessageAction } from "../../ocpp";
import { ocppRegistry } from "../../ocpp-registry";

describe("OcppRegistryService", () => {
  afterEach(() => {
    ocppRegistry.clear();
  });

  test("should add OCPP message", () => {
    ocppRegistry.addMessage([2, "id", OcppMessageAction.HEARTBEAT, {}]);
    const isPresent = !!ocppRegistry.getMessage("id");
    expect(isPresent).toBe(true);
  });

  test("should remove OCPP message", () => {
    ocppRegistry.addMessage([2, "id", OcppMessageAction.HEARTBEAT, {}]);
    ocppRegistry.removeMessage("id");

    const isPresent = !!ocppRegistry.getMessage("id");
    expect(isPresent).toBe(false);
  });
});
