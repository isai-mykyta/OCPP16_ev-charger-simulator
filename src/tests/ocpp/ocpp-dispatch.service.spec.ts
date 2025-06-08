import { ChargePointErrorCode, ChargePointStatus, OcppDispatchService, OcppMessageAction, OcppMessageType } from "../../ocpp";

describe("OCPP-dispatch service", () => {
  let ocppService: OcppDispatchService;

  beforeEach(() => {
    ocppService = new OcppDispatchService();
  });

  test("should generate OCPP Heartbeat request", () => {
    const request = ocppService.hearbeatReq();

    expect(request[0]).toBe(OcppMessageType.CALL);
    expect(request[2]).toBe(OcppMessageAction.HEARTBEAT);
    expect(request[3]).toStrictEqual({});
  });

  test("should generate OCPP StatusNotification request", () => {
    const payload = {
      connectorId: 1,
      errorCode: ChargePointErrorCode.NO_ERROR,
      status: ChargePointStatus.AVAILABLE
    };

    const request = ocppService.statusNotificationReq(payload);

    expect(request[0]).toBe(OcppMessageType.CALL);
    expect(request[2]).toBe(OcppMessageAction.STATUS_NOTIFICATION);
    expect(request[3]).toStrictEqual(payload);
  });

  test("should generate OCPP BootNotification request", () => {
    const payload = {
      chargePointModel: "test-model",
      chargePointVendor: "test-vendor",
    };

    const request = ocppService.bootNotificationReq(payload);

    expect(request[0]).toBe(OcppMessageType.CALL);
    expect(request[2]).toBe(OcppMessageAction.BOOT_NOTIFICATION);
    expect(request[3]).toStrictEqual(payload);
  });
});
