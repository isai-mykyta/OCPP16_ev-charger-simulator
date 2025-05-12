import { 
  OcppErrorCode, 
  OcppMessageAction, 
  OcppMessageType 
} from "../../ocpp";
import { 
  callErrorMessage,
  callMessage, 
  callResultMessage, 
  mapErrorConstraintToErrorCode 
} from "../../utils";

describe("OCPP utils", () => {
  describe("mapErrorConstraintToErrorCode", () => {
    test("Should return FORMATION_VIOLATION error code", () => {
      const constraints = [
        "isEmail",
        "isUUID",
        "isDateString",
        "isUrl",
        "whitelistValidation",
        "maxLength",
        "minLength",
        "length",
        "isEnum",
      ];

      constraints.forEach((constraint) => {
        expect(mapErrorConstraintToErrorCode(constraint)).toBe(OcppErrorCode.FORMATION_VIOLATION);
      });
    });

    test("Should return TYPE_CONSTRAINT_VIOLATION error code", () => {
      const constraints = [
        "isInt",
        "isBoolean",
        "isString",
        "isNumber"
      ];

      constraints.forEach((constraint) => {
        expect(mapErrorConstraintToErrorCode(constraint)).toBe(OcppErrorCode.TYPE_CONSTRAINT_VIOLATION);
      });
    });

    test("Should return PROTOCOL_ERROR error code", () => {
      expect(mapErrorConstraintToErrorCode("isNotEmpty")).toBe(OcppErrorCode.PROTOCOL_ERROR);
    });

    test("Should return NOT_IMPLEMENTED error code", () => {
      expect(mapErrorConstraintToErrorCode("customValidation")).toBe(OcppErrorCode.NOT_IMPLEMENTED);
    });

    test("Should return GENERIC_ERROR error code", () => {
      expect(mapErrorConstraintToErrorCode("invalidConstraint")).toBe(OcppErrorCode.GENERIC_ERROR);
    });
  });
});

describe("CallMessage", () => {
  test("should return valid OCPP call message", () => {
    const message = callMessage(OcppMessageAction.BOOT_NOTIFICATION, {});
    expect(message.length).toBe(4);
    expect(message[0]).toBe(OcppMessageType.CALL);
    expect(message[2]).toBe(OcppMessageAction.BOOT_NOTIFICATION);
    expect(message[3]).toStrictEqual({});
  });
});

describe("CallResultMessage", () => {
  test("should return valid OCPP call result message", () => {
    const message = callResultMessage("id", {});
    expect(message.length).toBe(3);
    expect(message[0]).toBe(OcppMessageType.RESULT);
    expect(message[1]).toBe("id");
    expect(message[2]).toStrictEqual({});
  });
});

describe("CallErrorMessage", () => {
  test("should return valid OCPP call error message", () => {
    const message = callErrorMessage("id", OcppErrorCode.FORMATION_VIOLATION, "error-description");
    expect(message.length).toBe(5);
    expect(message[0]).toBe(OcppMessageType.ERROR);
    expect(message[1]).toBe("id");
    expect(message[2]).toStrictEqual(OcppErrorCode.FORMATION_VIOLATION);
    expect(message[3]).toStrictEqual("error-description");
  });
});
