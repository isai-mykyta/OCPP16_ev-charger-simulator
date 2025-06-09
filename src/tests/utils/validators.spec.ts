import { isBoolString, isPositiveIntegerString } from "../../utils";

describe("Validators Utils", () => {
  describe("isPositiveIntegerString", () => {
    test("should validate positive int string", () => {
      expect(isPositiveIntegerString("1")).toBe(true);
      expect(isPositiveIntegerString("100")).toBe(true);
    });

    test("should reject invalid int string", () => {
      expect(isPositiveIntegerString("1.5")).toBe(false);
      expect(isPositiveIntegerString("-15")).toBe(false);
    });
  });

  describe("isBoolString", () => {
    test("should validate bool string", () => {
      expect(isBoolString("true")).toBe(true);
      expect(isBoolString("false")).toBe(true);
    });

    test("should reject bool string", () => {
      expect(isBoolString("1")).toBe(false);
      expect(isBoolString("0")).toBe(false);
    });
  });
});
