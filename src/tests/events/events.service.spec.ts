import { eventsService } from "../../events/events.service";

describe("EventsService", () => {
  test("should emit and handle 'simulatorConnected' event", () => {
    const handler = jest.fn();

    eventsService.on("simulatorConnected", handler);
    eventsService.emit("simulatorConnected", { identity: "CP_1" });

    expect(handler).toHaveBeenCalledWith({ identity: "CP_1" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("should not call unrelated listeners", () => {
    const connectedHandler = jest.fn();
    const disconnectedHandler = jest.fn();

    eventsService.on("simulatorConnected", connectedHandler);
    eventsService.on("simulatorDisconnected", disconnectedHandler);

    eventsService.emit("simulatorConnected", { identity: "CP_2" });

    expect(connectedHandler).toHaveBeenCalled();
    expect(disconnectedHandler).not.toHaveBeenCalled();
  });

  test("should allow multiple listeners for same event", () => {
    const h1 = jest.fn();
    const h2 = jest.fn();

    eventsService.on("simulatorConnected", h1);
    eventsService.on("simulatorConnected", h2);

    eventsService.emit("simulatorConnected", { identity: "CP_3" });

    expect(h1).toHaveBeenCalledWith({ identity: "CP_3" });
    expect(h2).toHaveBeenCalledWith({ identity: "CP_3" });
  });
});
