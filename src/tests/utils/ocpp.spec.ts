import { OcppErrorCode } from "../../ocpp";
import { mapErrorConstraintToErrorCode } from "../../utils";

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
