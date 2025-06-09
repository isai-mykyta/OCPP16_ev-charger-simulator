import { CallMessage, OcppMessageAction, OcppMessageType } from "../../ocpp";
import { OcppValidator } from "../../ocpp/ocpp.validator";
import { HeartbeatConfSchema } from "../../ocpp/schemas";

describe("OcppValidator", () => {
  let ocppValidator: OcppValidator;

  beforeEach(() => {
    ocppValidator = new OcppValidator();
  });

  test("should validate OCPP call message", () => {
    const callMessage: CallMessage<{}> = [OcppMessageType.CALL, "testId", OcppMessageAction.HEARTBEAT, {}];
    const isValid = ocppValidator.validateOcppCallMessage(callMessage);
    expect(isValid).toBe(true);
  });

  test("should validate OCPP payload", () => {
    const heartbeatPaylod = { currentTime: new Date().toISOString() };
    const { isValid } = ocppValidator.validateOcppPayload(heartbeatPaylod, HeartbeatConfSchema);
    expect(isValid).toBe(true);
  });

  test("should validate OCPP request payload", () => {
    const { isValid } = ocppValidator.validateOcppRequestPayload(OcppMessageAction.GET_CONFIGURATION, {});
    expect(isValid).toBe(true);
  });

  test("should validate OCPP response payload", () => {
    const heartbeatPaylod = { currentTime: new Date().toISOString() };
    const { isValid } = ocppValidator.validateOcppResponsePayload(OcppMessageAction.HEARTBEAT, heartbeatPaylod);
    expect(isValid).toBe(true);
  });

  test("should validate OCPP response payload if no validator is provided", () => {
    const { isValid } = ocppValidator.validateOcppResponsePayload(OcppMessageAction.STATUS_NOTIFICATION, {});
    expect(isValid).toBe(true);
  });
});
