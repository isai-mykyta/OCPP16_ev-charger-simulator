import { eventsService } from "../../events/events.service";

describe("EventsService", () => {
  test("should emit and triggerBootNotification event", () => {
    const handler = jest.fn();

    eventsService.on("triggerBootNotification", handler);
    eventsService.emit("triggerBootNotification", { identity: "CP_1" });

    expect(handler).toHaveBeenCalledWith({ identity: "CP_1" });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
